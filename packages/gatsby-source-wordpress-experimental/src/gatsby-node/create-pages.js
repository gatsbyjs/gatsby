import { resolve } from "path"
import urlToPath from "../utils/url-to-path"
import getTemplates from "../utils/get-templates"
import gql from "../utils/gql"

export default async ({ actions, graphql }) => {
  const {
    data: { allWpContentType },
  } = await graphql(gql`
    query ALL_CONTENT_TYPES {
      allWpContentType {
        nodes {
          singularName
          pluralName
          nodesTypeName
        }
      }
    }
  `)

  const templates = getTemplates()

  const contentTypeTemplates = templates.filter(path =>
    path.includes(`./src/templates/types/`)
  )

  for (const contentType of allWpContentType.nodes) {
    const { nodesTypeName, singularName } = contentType

    // this is a super super basic template hierarchy
    // this doesn't reflect what our hierarchy will look like.
    // this is for testing/demo purposes
    const contentTypeTemplate = contentTypeTemplates.find(
      path => path === `./src/templates/types/${singularName}.js`
    )

    if (!contentTypeTemplate) {
      continue
    }

    const gatsbyNodeListFieldName = `allWp${nodesTypeName}`

    const { data } = await graphql(`
      query ALL_CONTENT_NODES {
        ${gatsbyNodeListFieldName} {
          nodes {
            link
            id
          }
        }
      }
    `)

    const { nodes } = data[gatsbyNodeListFieldName]

    await Promise.all(
      nodes.map(async (node, i) => {
        await actions.createPage({
          component: resolve(contentTypeTemplate),
          path: urlToPath(node.link),
          context: {
            id: node.id,
            nextPage: (nodes[i + 1] || {}).id,
            previousPage: (nodes[i - 1] || {}).id,
          },
        })
      })
    )
  }
}
