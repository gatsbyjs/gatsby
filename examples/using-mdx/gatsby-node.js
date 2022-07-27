const path = require("path")

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('Error loading MDX result', result.errors)
  }

  const posts = result.data.allMdx.nodes

  posts.forEach(node => {
    // Don't create a page for src/pages/chart-info.mdx since this already gets created
    if (node.frontmatter.slug !== `/chart-info`) {
      if (node.frontmatter.slug === `/blog-1`) {
        // For /blog-1 create a page without defining a contentFilePath and just using the layout defined in src/components/layout.jsx
        createPage({
          path: node.frontmatter.slug,
          component: node.internal.contentFilePath,
          context: { id: node.id },
        })
      } else {
        // For /blog-2 define a contentFilePath and thus have two layouts. The src/components/layout.jsx and nested inside that the src/templates/posts.jsx
        createPage({
          path: node.frontmatter.slug,
          component: `${path.resolve(`./src/templates/posts.jsx`)}?__contentFilePath=${node.internal.contentFilePath}`,
          context: { id: node.id },
        })
      }
    }
  })
}