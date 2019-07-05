const { LocalNodeModel } = require(`./node-model`)

const withResolverContext = (context, schema, schemaComposer) => {
  const nodeStore = require(`../db/nodes`)
  const createPageDependency = require(`../redux/actions/add-page-dependency`)

  return {
    ...context,
    nodeModel: new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer,
      createPageDependency,
      path: context.path,
    }),
  }
}

module.exports = withResolverContext
