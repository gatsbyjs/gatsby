const nodeModel = require(`./node-model`)

const withResolverContext = context => {
  return { ...context, nodeModel }
}

module.exports = withResolverContext
