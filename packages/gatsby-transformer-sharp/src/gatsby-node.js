const { onCreateNode, onCreateNodeSyncTest } = require(`./on-node-create`)
exports.onCreateNode = onCreateNode
exports.onCreateNodeSyncTest = onCreateNodeSyncTest
exports.createSchemaCustomization = require(`./customize-schema`)
exports.createResolvers = require(`./create-resolvers`)
