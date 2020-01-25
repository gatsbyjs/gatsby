import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"

/**
 * paginatedWpNodeFetch
 *
 * recursively fetches/paginates remote nodes
 */
const paginatedWpNodeFetch = async ({
  contentTypePlural,
  url,
  query,
  nodeTypeName,
  activity,
  helpers,
  settings,
  allContentNodes = [],
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

  if (variables.first === 0) {
    return allContentNodes
  }

  const response = await fetchGraphql({
    query,
    variables,
  })

  const { data } = response

  if (!data[contentTypePlural] || !data[contentTypePlural].nodes) {
    return allContentNodes
  }

  if (allContentNodes.length > 1000) {
    return allContentNodes
  }

  const {
    [contentTypePlural]: { nodes, pageInfo: { hasNextPage, endCursor } = {} },
  } = data

  if (nodes) {
    nodes.forEach(node => {
      node.type = nodeTypeName
      // this is used to filter node interfaces by content types
      node.nodeType = nodeTypeName
      allContentNodes.push(node)
    })

    activity.setStatus(`fetched ${allContentNodes.length}`)

    store.dispatch.logger.incrementBy(nodes.length)
  }

  if (hasNextPage) {
    await paginatedWpNodeFetch({
      after: endCursor,
      url,
      contentTypePlural,
      nodeTypeName,
      query,
      allContentNodes,
      activity,
      helpers,
      settings,
      ...variables,
    })
  }

  return allContentNodes
}

export default paginatedWpNodeFetch
