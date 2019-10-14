const path = require(`path`)
const slash = require(`slash`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
  return graphql(
    `
      {
        allMarkdownRemark(
          limit: 1000
          filter: { frontmatter: { draft: { ne: true } } }
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create blog posts pages.
    result.data.allMarkdownRemark.edges.forEach(edge => {
      createPage({
        path: edge.node.fields.slug, // required
        component: slash(blogPostTemplate),
        context: {
          slug: edge.node.fields.slug,
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    let nodeSlug
    nodeSlug = ensureSlashes(
      path.basename(fileNode.relativePath, path.extname(fileNode.relativePath))
    )
    if (nodeSlug) {
      createNodeField({ node, name: `slug`, value: nodeSlug })
    }
  }
}

function ensureSlashes(slug) {
  if (slug.charAt(0) !== `/`) {
    slug = `/` + slug
  }

  if (slug.charAt(slug.length - 1) !== `/`) {
    slug = slug + `/`
  }

  return slug
}
