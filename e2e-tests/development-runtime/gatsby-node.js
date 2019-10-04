const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = function onCreateNode({
  actions: { createNodeField },
  node,
  getNode,
}) {
  switch (node.internal.type) {
    case `MarkdownRemark`: {
      const slug = createFilePath({
        node,
        getNode,
      })

      createNodeField({
        name: `slug`,
        value: slug,
        node,
      })
      break
    }

    default: {
      break
    }
  }
}

exports.createPages = async function createPages({
  actions: { createPage },
  graphql,
}) {
  const { data } = await graphql(`
    {
      posts: allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }

      allFakeData {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `)

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  const previewItemTemplate = path.resolve(`src/templates/preview-item.js`)

  data.posts.edges.forEach(({ node }) => {
    const { slug } = node.fields
    createPage({
      path: slug,
      component: blogPostTemplate,
      context: {
        slug,
      },
    })
  })

  data.allFakeData.nodes.forEach(node => {
    const { slug } = node.fields
    createPage({
      path: slug,
      component: previewItemTemplate,
      context: {
        slug,
      },
    })
  })

  createPage({
    path: `/안녕`,
    component: path.resolve(`src/pages/page-2.js`),
  })

  createPage({
    path: `/client-only-paths/static`,
    component: path.resolve(`src/templates/static-page.js`),
  })
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  if (page.path.match(/^\/client-only-paths/)) {
    page.matchPath = `/client-only-paths/*`
    createPage(page)
  }
}
