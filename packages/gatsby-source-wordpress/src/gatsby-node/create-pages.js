import { resolve } from "path"
import getTemplates from "../utils/get-templates"

export default async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query ALL_CONTENT_NODES {
      allWpContent(filter: { link: { ne: null } }) {
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
      // templates[0] will be replaced with a template hierarchy
      // this whole create-pages should also be moved to a theme
      // instead of gatsby-source-wpgraphql
      const template = resolve(templates[0])

      await actions.createPage({
        component: template,
        path: node.path,
        context: {
          id: node.id,
        },
      })
    })
  )
}
