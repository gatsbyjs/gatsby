exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allKontentItemArticle {
        nodes {
          elements {
            slug {
              value
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(result.errors)
  }

  result.data.articles.nodes.map(article => {
    createPage({
      path: "/" + article.elements.slug.value,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        slug: article.elements.slug.value,
      }
    })
  })
}