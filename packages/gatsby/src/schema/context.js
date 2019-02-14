const { LocalNodeModel } = require(`./node-model`)

const withResolverContext = (context, schema) => {
  const nodeStore = require(`../db/nodes`)
  const createPageDependency = require(`../redux/actions/add-page-dependency`)

  return {
    ...context,
    nodeModel: new LocalNodeModel({ nodeStore, schema, createPageDependency }),
  }
}

module.exports = withResolverContext
