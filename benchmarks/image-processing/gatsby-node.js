const path = require(`path`)

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    query MyQuery {
      allRemoteImage {
        totalCount
        nodes {
          id
        }
      }
    }
  `).then(results => {
    results.data.allRemoteImage.nodes.map(n => {
      createPage({
        path: `/${n.id}/`,
        component: path.resolve(`./src/templates/image.js`),
        context: {
          id: n.id,
        },
      })
    })
  })
}
