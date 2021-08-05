const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./on-node-create`)
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.onCreateNode = onCreateNode
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).default
