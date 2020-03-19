import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"

/**
 * paginatedWpNodeFetch
 *
 * recursively fetches/paginates remote nodes
 */
const paginatedWpNodeFetch = async ({
  contentTypePlural,
  query,
  nodeTypeName,
  activity,
  helpers,
  allContentNodes = [],
  after = null,
  settings = {},
  ...variables
}) => {
  if (
    !settings.limit &&
    typeof settings.limit === `number` &&
    settings.limit === 0
  ) {
    // if the Type.limit plugin option is set to the number 0,
    // we shouldn't fetch anything
    return []
  }

  if (
    settings.limit &&
    // if we're about to fetch more than our limit
    allContentNodes.length + variables.first > settings.limit
  ) {
    // just fetch whatever number is remaining
    variables.first = settings.limit - allContentNodes.length
  }

  // if the GQL var "first" is greater than our Type.limit plugin option,
  // that's no good
  if (settings.limit && settings.limit < variables.first) {
    // so just fetch our limit
    variables.first = settings.limit
  }

  const typeCount = store.getState().logger.typeCount[nodeTypeName] || 0

  const response = await fetchGraphql({
    query,
    variables: {
      ...variables,
      after,
    },
  })

  const { data } = response

  if (!data[contentTypePlural] || !data[contentTypePlural].nodes) {
    return allContentNodes
  }

  const {
    [contentTypePlural]: { nodes, pageInfo: { hasNextPage, endCursor } = {} },
  } = data

  if (nodes && nodes.length) {
    nodes.forEach(node => {
      node.type = nodeTypeName
      // this is used to filter node interfaces by content types
      node.nodeType = nodeTypeName
      allContentNodes.push(node)
    })

    const updatedTypeCount = typeCount + nodes.length

    if (activity) {
      activity.setStatus(`fetched ${updatedTypeCount}`)
    }

    store.dispatch.logger.incrementTypeBy({
      count: nodes.length,
      type: nodeTypeName,
    })
  }

  if (
    hasNextPage &&
    (!settings.limit || settings.limit < allContentNodes.length)
  ) {
    return paginatedWpNodeFetch({
      ...variables,
      contentTypePlural,
      nodeTypeName,
      query,
      allContentNodes,
      activity,
      helpers,
      settings,
      after: endCursor,
    })
  } else {
    return allContentNodes
  }
}

export { paginatedWpNodeFetch }
