const { LocalNodeModel } = require(`./node-model`)
const { defaultFieldResolver } = require(`./resolvers`)

const withResolverContext = ({
  schema,
  schemaComposer,
  context,
  customContext,
  nodeModel,
  parentSpan,
}) => {
  const nodeStore = require(`../db/nodes`)
  const createPageDependency = require(`../redux/actions/add-page-dependency`)

  if (!nodeModel) {
    nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer,
      createPageDependency,
    })
  }

  return {
    ...(context || {}),
    ...(customContext || {}),
    defaultFieldResolver,
    parentSpan,
    nodeModel: nodeModel.withContext({
      path: context ? context.path : undefined,
    }),
  }
}

module.exports = withResolverContext
