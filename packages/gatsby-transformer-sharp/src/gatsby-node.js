const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./on-node-create`)
const { ERROR_MAP } = require(`./error-utils`)

exports.onPreInit = ({ reporter }) => {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}
exports.onCreateNode = onCreateNode
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.createSchemaCustomization = require(`./customize-schema`)
exports.createResolvers = require(`./create-resolvers`)
