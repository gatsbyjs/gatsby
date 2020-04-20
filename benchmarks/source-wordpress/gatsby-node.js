exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allWpPost {
        nodes {
          uri
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
      path: article.uri,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        id: article.id,
      },
    })
  })
}
