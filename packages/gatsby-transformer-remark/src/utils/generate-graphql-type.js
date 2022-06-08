const { get } = require(`lodash`)

module.exports = async function generateGraphQLType(
  helpers,
  pluginOptions,
  frontmatter
) {
  const { reporter } = helpers
  const { contentTypes } = pluginOptions

  if (contentTypes) {
    const type =
      typeof contentTypes.resolveType === `string`
        ? get(frontmatter, contentTypes.resolveType)
        : await contentTypes.resolveType(frontmatter)

    if (!contentTypes.types.includes(type)) {
      reporter.error(
        `Type '${type}' does not match any of the provided contentTypes.`
      )
    }

    return `MarkdownRemark${type}`
  }

  return `MarkdownRemark`
}
