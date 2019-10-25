const path = require(`path`)
const getTemplates = require(`../utils/get-templates`)

module.exports = async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query ALL_CONTENT_NODES {
      allWpContent {
        nodes {
          path
          id
        }
      }
    }
  `)

  const templates = getTemplates()

  await Promise.all(
    data.allWpContent.nodes.map(async node => {
      const template = path.resolve(templates[0])

      await actions.createPage({
        component: template,
        path: node.path,
        context: {
          ID: node.id,
        },
      })
    })
  )
}
