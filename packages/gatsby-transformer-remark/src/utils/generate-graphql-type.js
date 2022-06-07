const { get } = require(`lodash`)

module.exports = async function generateGraphQLType(
  helpers,
  pluginOptions,
  frontmatter
) {
  const { reporter } = helpers
  const { subtypes } = pluginOptions

  if (subtypes) {
    const type =
      typeof subtypes.resolveType === `string`
        ? get(frontmatter, subtypes.resolveType)
        : await subtypes.resolveType(frontmatter)

    if (!subtypes.types.includes(type)) {
      reporter.error(
        `Type '${type}' does not match any of the provided subtypes.`
      )
    }

    return `MarkdownRemark${type}`
  }

  return `MarkdownRemark`
}
