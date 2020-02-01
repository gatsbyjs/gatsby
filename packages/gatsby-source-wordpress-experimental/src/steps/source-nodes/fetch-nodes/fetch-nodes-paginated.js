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
    settings.limit &&
    // if we're about to fetch more than our limit
    allContentNodes.length + variables.first > settings.limit
  ) {
    // just fetch whatever number is remaining
    variables.first = settings.limit - allContentNodes.length
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

  if (hasNextPage) {
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
