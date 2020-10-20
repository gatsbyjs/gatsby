const kebabCase = require(`lodash.kebabcase`)

exports.onCreateNode = ({ actions, node }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'node__article') {
    createNodeField({ node, name: "slug", value: kebabCase(node.title) })
  }
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allCosmicjsPosts {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(result.errors)
  }

  result.data.articles.edges.map(article => {
    createPage({
      path: article.node.slug,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        slug: article.node.slug,
      }
    })
  })
}