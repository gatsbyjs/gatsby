exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type BlogThemeConfig implements Node {
      disableThemeUiStyling: Boolean
    }
  `)
}

exports.sourceNodes = (
  { actions, createContentDigest },
  { disableThemeUiStyling = false }
) => {
  const { createNode } = actions

  const blogThemeConfig = {
    disableThemeUiStyling,
  }

  createNode({
    ...blogThemeConfig,
    id: `gatsby-theme-blog-config`,
    parent: null,
    children: [],
    internal: {
      type: `BlogThemeConfig`,
      contentDigest: createContentDigest(blogThemeConfig),
      content: JSON.stringify(blogThemeConfig),
      description: `Options for gatsby-theme-blog`,
    },
  })
}
