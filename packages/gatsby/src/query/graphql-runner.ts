import crypto from "crypto"
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
} from "graphql"
import { debounce } from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { createPageDependency } from "../redux/actions/add-page-dependency"

import withResolverContext from "../schema/context"
import { LocalNodeModel } from "../schema/node-model"
import { Store } from "redux"
import { IGatsbyState } from "../redux/types"
import { IGraphQLRunnerStatResults, IGraphQLRunnerStats } from "./types"
import GraphQLSpanTracer from "./graphql-span-tracer"

type Query = string | Source

export interface IGraphQLRunnerOptions {
  collectStats?: boolean
  graphqlTracing?: boolean
}

export class GraphQLRunner {
  parseCache: Map<Query, DocumentNode>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel: any // TODO: convert "../schema/node-model" from Flow

  schema: GraphQLSchema

  validDocuments: WeakSet<DocumentNode>
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
    })
    this.schema = schema
    this.parseCache = new Map()
    this.validDocuments = new WeakSet()
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
    this.validDocuments = new WeakSet()
  }

  parse(query: Query): DocumentNode {
    if (!this.parseCache.has(query)) {
      this.parseCache.set(query, parse(query))
    }
    return this.parseCache.get(query) as DocumentNode
  }

  validate(
    schema: GraphQLSchema,
    document: DocumentNode
  ): {
    errors: ReadonlyArray<GraphQLError>
    warnings: ReadonlyArray<GraphQLError>
  } {
    let errors: ReadonlyArray<GraphQLError> = []
    let warnings: ReadonlyArray<GraphQLError> = []
    if (!this.validDocuments.has(document)) {
      errors = validate(schema, document)
      warnings = validate(schema, document, [NoDeprecatedCustomRule])
      if (!errors.length) {
        this.validDocuments.add(document)
      }
    }
    return { errors, warnings }
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
    }: {
      parentSpan: Span | undefined
      queryName: string
      componentPath?: string | undefined
    }
  ): Promise<ExecutionResult> {
    const { schema, schemaCustomization } = this.store.getState()

    if (this.schema !== schema) {
      this.schema = schema
      this.clearCache()
    }

    if (this.stats) {
      this.stats.totalQueries++
      let statsQuery = query
      if (typeof statsQuery !== `string`) {
        statsQuery = statsQuery.body
      }

      this.stats.uniqueQueries.add(
        crypto.createHash(`sha1`).update(statsQuery).digest(`hex`)
      )
    }

    const document = this.parse(query)
    const { errors, warnings } = this.validate(schema, document)

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
    if (this.graphqlTracing && parentSpan) {
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
