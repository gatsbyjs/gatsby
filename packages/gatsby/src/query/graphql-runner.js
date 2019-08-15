const { graphql } = require(`graphql`)

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
  }

  query(query, context) {
    const { schema, schemaCustomization } = this.store.getState()

    return graphql(
      schema,
      query,
      context,
      withResolverContext({
        schema,
        schemaComposer: schemaCustomization.composer,
        context,
        customContext: schemaCustomization.context,
        nodeModel: this.nodeModel,
      }),
      context
    )
  }
}

module.exports = GraphQLRunner
