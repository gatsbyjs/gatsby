import { resolve } from "path"
import createPermalinkPath from "../utils/create-permalink-path"
import getTemplates from "../utils/get-templates"
import gql from "../utils/gql"

export default async ({ actions, graphql }) => {
  const {
    data: { allWpContentType },
  } = await graphql(gql`
    query ALL_CONTENT_TYPES {
      allWpContentType {
        nodes {
          singleName
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
    const { nodesTypeName, singleName } = contentType

    // this is a super super basic template hierarchy
    // this doesn't reflect what our hierarchy will look like.
    // this is for testing/demo purposes
    const contentTypeTemplate = contentTypeTemplates.find(
      path => path === `./src/templates/types/${singleName}.js`
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

    await Promise.all(
      data[gatsbyNodeListFieldName].nodes.map(async node => {
        await actions.createPage({
          component: resolve(contentTypeTemplate),
          path: createPermalinkPath(node.link),
          context: {
            id: node.id,
          },
        })
      })
    )
  }
}
