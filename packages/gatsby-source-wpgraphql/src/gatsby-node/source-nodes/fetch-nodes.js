const { dd } = require(`dumper.js`)

const { createGatsbyNodesFromWPGQLContentNodes } = require(`./create-nodes`)
const paginatedWpNodeFetch = require(`./paginated-wp-node-fetch`)

const { CREATED_NODE_IDS } = require(`../constants`)

const {
  buildNodeQueriesFromIntrospection,
} = require(`./generate-queries-from-introspection`)

const fetchWPGQLContentNodes = async ({ queries }, _, { url }) => {
  const contentNodeGroups = []

  for (const [fieldName, queryInfo] of Object.entries(queries)) {
    const { queryString, typeInfo } = queryInfo

    const allNodesOfContentType = await paginatedWpNodeFetch({
      first: 100,
      after: null,
      contentTypePlural: typeInfo.pluralName,
      contentTypeSingular: typeInfo.singleName,
      nodeTypeName: typeInfo.nodesTypeName,
      url,
      query: queryString,
    })

    if (allNodesOfContentType && allNodesOfContentType.length) {
      contentNodeGroups.push({
        singular: fieldName,
        plural: fieldName,
        allNodesOfContentType,
      })
    }
  }

  // this fetches multiple endpoints at once
  // await Promise.all(
  //   Object.entries(queryStrings).map(
  //     ([fieldName, query]) =>
  //       new Promise(async resolve => {
  //         const allNodesOfContentType = await paginatedWpNodeFetch({
  //           first: 10,
  //           after: null,
  //           contentTypePlural: fieldName,
  //           contentTypeSingular: fieldName,
  //           url,
  //           query,
  //         })

  //         if (allNodesOfContentType && allNodesOfContentType.length) {
  //           contentNodeGroups.push({
  //             singular: fieldName,
  //             plural: fieldName,
  //             allNodesOfContentType,
  //           })
  //         }

  //         return resolve()
  //       })
  //   )
  // )

  return contentNodeGroups
}

const fetchAndCreateAllNodes = async (_, helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  const { reporter } = helpers

  let activity

  //
  // Introspect schema and build gql queries
  activity = reporter.activityTimer(
    `[gatsby-source-wpgraphql] introspect schema`
  )
  activity.start()
  const queries = await buildNodeQueriesFromIntrospection(...api)
  activity.end()

  activity = reporter.activityTimer(`[gatsby-source-wpgraphql] fetch content`)
  activity.start()
  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(
    { queries },
    ...api
  )
  activity.end()

  //
  // Create nodes
  activity = reporter.activityTimer(`[gatsby-source-wpgraphql] create nodes`)
  activity.start()
  const createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes(
    {
      wpgqlNodesByContentType,
    },
    ...api
  )

  const { cache } = helpers

  // save the node id's so we can touch them on the next build
  // so that we don't have to refetch all nodes
  await cache.set(CREATED_NODE_IDS, createdNodeIds)
  activity.end()
}

module.exports = { fetchWPGQLContentNodes, fetchAndCreateAllNodes }
