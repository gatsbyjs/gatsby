const { parse, validate, execute } = require(`graphql`)
const { debounce } = require(`lodash`)

const withResolverContext = require(`../schema/context`)
const { LocalNodeModel } = require(`../schema/node-model`)

class GraphQLRunner {
  constructor(store) {
    this.store = store
    const nodeStore = require(`../db/nodes`)
    const createPageDependency = require(`../redux/actions/add-page-dependency`)
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

  clearCache() {
    this.parseCache.clear()
    this.validDocuments = new WeakSet()
  }

  parse(query) {
    if (!this.parseCache.has(query)) {
      this.parseCache.set(query, parse(query))
    }
    return this.parseCache.get(query)
  }

  validate(schema, document) {
    if (!this.validDocuments.has(document)) {
      const errors = validate(schema, document)
      if (!errors.length) {
        this.validDocuments.add(document)
      }
      return errors
    }
    return []
  }

  query(query, context) {
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
    return result
  }
}

module.exports = GraphQLRunner
