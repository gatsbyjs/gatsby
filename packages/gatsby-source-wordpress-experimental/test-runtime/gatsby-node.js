const { resolve } = require(`path`)
const path = require(`path`)
const glob = require(`glob`)
const chunk = require(`lodash/chunk`)

const getTemplates = () => {
  const sitePath = path.resolve(`./`)
  return glob.sync(`./src/templates/**/*.js`, { cwd: sitePath })
}

//
// @todo move this to gatsby-theme-wordpress
exports.createPages = async ({ actions, graphql }) => {
  const {
    data: { allWpContentType },
  } = await graphql(`
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
            uri
            id
          }
        }
      }
    `)

    const { nodes } = data[gatsbyNodeListFieldName]

    await Promise.all(
      nodes.map(async (node, i) => {
        // @todo: determine why pages using allWpContentNode queries
        // don't get automatically updated with incremental data fetching
        await actions.createPage({
          component: resolve(contentTypeTemplate),
          path: node.uri,
          context: {
            id: node.id,
            nextPage: (nodes[i + 1] || {}).id,
            previousPage: (nodes[i - 1] || {}).id,
          },
        })
      })
    )
  }

  // create the homepage
  const { data } = await graphql(`
    {
      allWpPost(sort: { fields: date, order: DESC }) {
        nodes {
          uri
          id
        }
      }
    }
  `)

  const perPage = 10
  const chunkedContentNodes = chunk(data.allWpPost.nodes, perPage)

  await Promise.all(
    chunkedContentNodes.map(async (nodesChunk, i) => {
      const firstNode = nodesChunk[0]
      const page = i + 1

      await actions.createPage({
        component: resolve(`./src/templates/index.js`),
        path: page === 1 ? `/blog/` : `/blog/${page}/`,
        context: {
          firstId: firstNode.id,
          page: page,
          offset: perPage * page,
          totalPages: chunkedContentNodes.length - 1,
          perPage,
        },
      })
    })
  )
}
