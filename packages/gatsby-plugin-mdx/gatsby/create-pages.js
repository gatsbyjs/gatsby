const defaultOptions = require(`../utils/default-options`)

module.exports = ({ graphql, actions, getNode }, pluginOptions) => {
  const { extensions } = defaultOptions(pluginOptions)

  const { createPage } = actions

  // shadowable page template
  const mdxPageTemplate = require.resolve(`../src/templates/mdx-page-query.js`)

  return graphql(
    `
      query gatsbyMdxSrcPagesQuery($extensions: [String!]!) {
        allFile(
          filter: {
            ext: { in: $extensions }
            sourceInstanceName: { eq: "gatsby-plugin-mdx-src-pages" }
          }
        ) {
          nodes {
            relativePath
            childMdx {
              id
            }
          }
        }
      }
    `,
    { extensions }
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create blog post pages.
    result.data.allFile.nodes.forEach(({ id, relativePath, childMdx }) => {
      const { frontmatter } = getNode(childMdx.id)
      createPage({
        // TODO: remove relativePath extension .mdx
        path: relativePath.slice(0, -`.mdx`.length),
        component: mdxPageTemplate,
        context: {
          id: childMdx.id,
          frontmatter,
        },
      })
    })
  })
}
