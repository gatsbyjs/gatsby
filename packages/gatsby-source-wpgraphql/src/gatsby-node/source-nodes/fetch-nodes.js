const { dd } = require(`dumper.js`)

const { createGatsbyNodesFromWPGQLContentNodes } = require(`./create-nodes`)
const paginatedWpNodeFetch = require(`./paginated-wp-node-fetch`)

const { CREATED_NODE_IDS } = require(`../constants`)

const {
  buildNodeQueriesFromIntrospection,
} = require(`./generate-queries-from-introspection`)

const {
  getAvailableContentTypes,
} = require(`./generate-queries-from-introspection/index`)

const fetchWPGQLContentNodes = async ({ queryStrings }, _, { url }) => {
  const contentTypes = await getAvailableContentTypes({ url })

  if (!contentTypes) {
    return false
  }

  const contentNodeGroups = []

  for (const [fieldName, query] of Object.entries(queryStrings)) {
    const allNodesOfContentType = await paginatedWpNodeFetch({
      first: 100,
      after: null,
      contentTypePlural: fieldName,
      contentTypeSingular: fieldName,
      url,
      query,
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

  // this just get's post types
  // await Promise.all(
  //   contentTypes.map(async ({ plural, singular }) => {
  //     const allNodesOfContentType = await paginatedWpNodeFetch({
  //       first: 10,
  //       after: null,
  //       contentTypePlural: plural,
  //       contentTypeSingular: singular,
  //       url,
  //     })

  //     contentNodeGroups.push({
  //       singular,
  //       plural,
  //       allNodesOfContentType,
  //     })
  //   })
  // )

  return contentNodeGroups
}

const fetchAndCreateAllNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  const queryStrings = await buildNodeQueriesFromIntrospection(...api)

  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(
    { queryStrings },
    ...api
  )

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
}

module.exports = { fetchWPGQLContentNodes, fetchAndCreateAllNodes }
