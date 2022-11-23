const { onCreateNode, shouldOnCreateNode } = require(`./on-node-create`)
exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).default
