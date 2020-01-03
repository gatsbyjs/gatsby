import fetchGraphql from "../../utils/fetch-graphql"
import store from "../../store"

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
    settings &&
    settings.limit &&
    allContentNodes.length &&
    allContentNodes.length >= settings.limit
  ) {
    return allContentNodes
  }

  if (
    settings.limit &&
    allContentNodes.length + variables.first > settings.limit
  ) {
    variables.first = settings.limit - allContentNodes.length
  }

  const response = await fetchGraphql({
    url,
    query,
    variables,
  })

  const { data } = response

  if (!data[contentTypePlural] || !data[contentTypePlural].nodes) {
    return allContentNodes
  }

  const {
    [contentTypePlural]: { nodes, pageInfo: { hasNextPage, endCursor } = {} },
  } = data

  if (nodes) {
    nodes.forEach(node => {
      node.type = nodeTypeName
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
