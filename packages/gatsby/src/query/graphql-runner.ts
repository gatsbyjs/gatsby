import { Span } from "opentracing"
import {
  parse,
  validate,
  execute,
  DocumentNode,
  GraphQLSchema,
  Source,
  GraphQLError,
  ExecutionResult,
  NoDeprecatedCustomRule,
  print,
} from "graphql"
import { debounce } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { sha1 } from "gatsby-core-utils/hash"

import { createPageDependency } from "../redux/actions/add-page-dependency"
import withResolverContext from "../schema/context"
import { LocalNodeModel } from "../schema/node-model"
import { Store } from "redux"
import { IGatsbyState } from "../redux/types"
import { IGraphQLRunnerStatResults, IGraphQLRunnerStats } from "./types"
import { IGraphQLTelemetryRecord } from "../schema/type-definitions"
import GraphQLSpanTracer from "./graphql-span-tracer"
import { tranformDocument } from "./transform-document"

// Preserve these caches across graphql instances.
const _rootNodeMap = new WeakMap()
const _trackedRootNodes = new WeakSet()

type Query = string | Source

export interface IQueryOptions {
  parentSpan: Span | undefined
  queryName: string
  componentPath?: string | undefined
  forceGraphqlTracing?: boolean
  telemetryResolverTimings?: Array<IGraphQLTelemetryRecord>
}

export interface IGraphQLRunnerOptions {
  collectStats?: boolean
  graphqlTracing?: boolean
}

export class GraphQLRunner {
  parseCache: Map<Query, DocumentNode>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel: any // TODO: convert "../schema/node-model" from Flow

  schema: GraphQLSchema

  validDocuments: WeakMap<DocumentNode, DocumentNode>
  scheduleClearCache: () => void

  stats: IGraphQLRunnerStats | null
  graphqlTracing: boolean

  constructor(
    protected store: Store<IGatsbyState>,
    { collectStats, graphqlTracing }: IGraphQLRunnerOptions = {}
  ) {
    const { schema, schemaCustomization } = this.store.getState()

    this.nodeModel = new LocalNodeModel({
      schema,
      schemaComposer: schemaCustomization.composer,
      createPageDependency,
      _rootNodeMap,
      _trackedRootNodes,
    })
    this.schema = schema
    this.parseCache = new Map()
    this.validDocuments = new WeakMap()
    this.scheduleClearCache = debounce(this.clearCache.bind(this), 5000)

    this.graphqlTracing = graphqlTracing || false

    if (collectStats) {
      this.stats = {
        totalQueries: 0,
        uniqueOperations: new Set(),
        uniqueQueries: new Set(),
        totalRunQuery: 0,
        totalPluralRunQuery: 0,
        totalIndexHits: 0,
        totalSiftHits: 0,
        totalNonSingleFilters: 0,
        comparatorsUsed: new Map(),
        uniqueFilterPaths: new Set(),
        uniqueSorts: new Set(),
      }
    } else {
      this.stats = null
    }
  }

  clearCache(): void {
    this.parseCache.clear()
    this.validDocuments = new WeakMap()
  }

  parse(query: Query): DocumentNode {
    if (!this.parseCache.has(query)) {
      this.parseCache.set(query, parse(query))
    }
    return this.parseCache.get(query) as DocumentNode
  }

  validate(
    schema: GraphQLSchema,
    originalQueryText: string,
    document: DocumentNode,
    originalDocument: DocumentNode = document
  ): {
    errors: ReadonlyArray<GraphQLError>
    warnings: ReadonlyArray<GraphQLError>
    document: DocumentNode
  } {
    let errors: ReadonlyArray<GraphQLError> = []
    let warnings: ReadonlyArray<GraphQLError> = []
    const validatedDocument = this.validDocuments.get(document)
    if (validatedDocument) {
      return { errors: [], warnings: [], document: validatedDocument }
    }

    errors = validate(schema, document)
    warnings = validate(schema, document, [NoDeprecatedCustomRule])

    if (!errors.length) {
      this.validDocuments.set(originalDocument, document)
    } else {
      const { ast: transformedDocument, hasChanged } =
        tranformDocument(document)
      if (hasChanged) {
        const { errors, warnings, document } = this.validate(
          schema,
          originalQueryText,
          transformedDocument,
          originalDocument
        )

        if (!errors.length) {
          reporter.warn(
            `Deprecated syntax of sort and/or aggregation field arguments were found in your query (see https://gatsby.dev/graphql-nested-sort-and-aggregate). Query was automatically converted to a new syntax. You should update query in your code.\n\nCurrent query:\n\n${reporter.stripIndent(
              originalQueryText
            )}\n\nConverted query:\n\n${print(transformedDocument)}`
          )
        }

        return { errors, warnings, document }
      }
    }

    return { errors, warnings, document }
  }

  getStats(): IGraphQLRunnerStatResults | null {
    if (this.stats) {
      const comparatorsUsedObj: Array<{
        comparator: string
        amount: number
      }> = []
      this.stats.comparatorsUsed.forEach((value, key) => {
        comparatorsUsedObj.push({ comparator: key, amount: value })
      })
      return {
        totalQueries: this.stats.totalQueries,
        uniqueOperations: this.stats.uniqueOperations.size,
        uniqueQueries: this.stats.uniqueQueries.size,
        totalRunQuery: this.stats.totalRunQuery,
        totalPluralRunQuery: this.stats.totalPluralRunQuery,
        totalIndexHits: this.stats.totalIndexHits,
        totalSiftHits: this.stats.totalSiftHits,
        totalNonSingleFilters: this.stats.totalNonSingleFilters,
        comparatorsUsed: comparatorsUsedObj,
        uniqueFilterPaths: this.stats.uniqueFilterPaths.size,
        uniqueSorts: this.stats.uniqueSorts.size,
      }
    } else {
      return null
    }
  }

  async query(
    query: Query,
    context: Record<string, unknown>,
    {
      parentSpan,
      queryName,
      componentPath,
      forceGraphqlTracing = false,
      telemetryResolverTimings,
    }: IQueryOptions
  ): Promise<ExecutionResult> {
    const { schema, schemaCustomization } = this.store.getState()

    if (this.schema !== schema) {
      this.schema = schema
      this.clearCache()
    }

    let queryText = query
    if (typeof queryText !== `string`) {
      queryText = queryText.body
    }

    if (this.stats) {
      this.stats.totalQueries++

      const hash = await sha1(queryText)

      this.stats.uniqueQueries.add(hash)
    }

    const { errors, warnings, document } = this.validate(
      schema,
      queryText,
      this.parse(query)
    )

    // Queries are usually executed in batch. But after the batch is finished
    // cache just wastes memory without much benefits.
    // TODO: consider a better strategy for cache purging/invalidation
    this.scheduleClearCache()

    if (warnings.length > 0) {
      // TODO: move those warnings to the caller side, e.g. query-runner.ts
      warnings.forEach(err => {
        const message = componentPath ? `\nQueried in ${componentPath}` : ``
        reporter.warn(err.message + message)
      })
    }

    if (errors.length > 0) {
      return { errors }
    }

    let tracer
    if ((this.graphqlTracing || forceGraphqlTracing) && parentSpan) {
      tracer = new GraphQLSpanTracer(`GraphQL Query`, {
        parentSpan,
        tags: {
          queryName: queryName,
        },
      })

      tracer.start()
    }

    try {
      // `execute` will return a promise
      return await execute({
        schema,
        document,
        rootValue: context,
        contextValue: withResolverContext({
          schema,
          schemaComposer: schemaCustomization.composer,
          context,
          customContext: schemaCustomization.context,
          nodeModel: this.nodeModel,
          stats: this.stats,
          tracer,
          telemetryResolverTimings,
        }),
        variableValues: context,
      })
    } finally {
      if (tracer) {
        tracer.end()
      }
    }
  }
}
