exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      articles: allSanityPost {
        nodes {
          _id
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(result.errors)
  }

  result.data.articles.nodes.map(article => {
    createPage({
      path: article._id,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        id: article._id,
      },
    })
  })
}
