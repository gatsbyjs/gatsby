const { LocalNodeModel } = require(`./node-model`)
const { fieldExtensions } = require(`./extensions`)

const withResolverContext = (context, schema) => {
  const nodeStore = require(`../db/nodes`)
  const createPageDependency = require(`../redux/actions/add-page-dependency`)

  return {
    ...context,
    fieldExtensions,
    nodeModel: new LocalNodeModel({
      nodeStore,
      schema,
      createPageDependency,
      path: context.path,
    }),
  }
}

module.exports = withResolverContext
