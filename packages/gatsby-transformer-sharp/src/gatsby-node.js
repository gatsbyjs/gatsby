const { onCreateNode, shouldOnCreateNode } = require(`./on-node-create`)
exports.onCreateNode = onCreateNode
exports.shouldOnCreateNode = shouldOnCreateNode
exports.createSchemaCustomization = require(`./customize-schema`)
exports.createResolvers = require(`./create-resolvers`)
