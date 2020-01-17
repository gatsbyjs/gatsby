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
    this.validDocuments = new WeakSet()
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
      this.validDocuments = new WeakSet()
    }

    const document =
      typeof query === `object` && query.kind === `Document`
        ? query
        : parse(query)

    const errors = this.validate(schema, document)

    return errors.length > 0
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
  }
}

module.exports = GraphQLRunner
