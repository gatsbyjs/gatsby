const kebabCase = require(`lodash.kebabcase`)

function unstable_shouldOnCreateNode({node}) {
  return node.internal.type === `node__article`
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

exports.onCreateNode = ({ actions, node }) => {
  const { createNodeField } = actions

  if (unstable_shouldOnCreateNode({node})) {
    createNodeField({ node, name: "slug", value: kebabCase(node.title) })
  }
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allArticle {
        nodes {
          id
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(result.errors)
  }

  result.data.articles.nodes.map(article => {
    createPage({
      path: article.id,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        slug: article.id,
      },
    })
  })
}
