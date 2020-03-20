import {
  parse,
  validate,
  execute,
  DocumentNode,
  GraphQLSchema,
  Source,
  GraphQLError,
  ExecutionResult,
} from "graphql"
import { debounce } from "lodash"
import nodeStore from "../db/nodes"
import { createPageDependency } from "../redux/actions/add-page-dependency"

import withResolverContext from "../schema/context"
import { LocalNodeModel } from "../schema/node-model"
import { Store } from "redux"
import { IReduxState } from "../redux/types"

type Query = string | Source

class GraphQLRunner {
  parseCache: Map<Query, DocumentNode>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel: any // TODO: convert "../schema/node-model" from Flow

  schema: GraphQLSchema

  validDocuments: WeakSet<DocumentNode>
  scheduleClearCache: () => void

  constructor(protected store: Store<IReduxState>) {
    const { schema, schemaCustomization } = this.store.getState()

    this.nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer: schemaCustomization.composer,
      createPageDependency,
    })
    this.schema = schema
    this.parseCache = new Map()
    this.validDocuments = new WeakSet()
    this.scheduleClearCache = debounce(this.clearCache.bind(this), 5000)
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
  ): readonly GraphQLError[] {
    if (!this.validDocuments.has(document)) {
      const errors = validate(schema, document)
      if (!errors.length) {
        this.validDocuments.add(document)
      }
      return errors
    }
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(query: Query, context: Record<string, any>): Promise<ExecutionResult> {
    const { schema, schemaCustomization } = this.store.getState()

    if (this.schema !== schema) {
      this.schema = schema
      this.clearCache()
    }

    const document = this.parse(query)
    const errors = this.validate(schema, document)

    const result =
      errors.length > 0
        ? { errors }
        : execute({
            schema,
            document,
            rootValue: context,
            contextValue: withResolverContext({
              schema,
              schemaComposer: schemaCustomization.composer,
              context,
              customContext: schemaCustomization.context,
              nodeModel: this.nodeModel,
            }),
            variableValues: context,
          })

    // Queries are usually executed in batch. But after the batch is finished
    // cache just wastes memory without much benefits.
    // TODO: consider a better strategy for cache purging/invalidation
    this.scheduleClearCache()
    return Promise.resolve(result)
  }
}

module.exports = GraphQLRunner
