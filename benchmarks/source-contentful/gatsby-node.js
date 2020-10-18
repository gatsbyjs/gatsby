exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allContentfulArticle {
        nodes {
          slug
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(result.errors)
  }

  result.data.articles.nodes.map(article => {
    createPage({
      path: article.slug,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        slug: article.slug,
      },
    })
  })
}
