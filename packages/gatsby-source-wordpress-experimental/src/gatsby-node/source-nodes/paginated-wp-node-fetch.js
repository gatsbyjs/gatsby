import fetchGraphql from "../../utils/fetch-graphql"
import store from "../../store"

const paginatedWpNodeFetch = async ({
  contentTypePlural,
  contentTypeSingular,
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
    // normalize nodes
    nodes.forEach(node => {
      node.contentType = contentTypeSingular
      node.contentTypePlural = contentTypePlural
      node.type = nodeTypeName
      node.wpId = node.id
      allContentNodes.push(node)
    })

    activity.setStatus(`fetched ${allContentNodes.length}`)

    store.dispatch.logger.incrementBy(nodes.length)
  }

  if (hasNextPage) {
    await paginatedWpNodeFetch({
      first: variables.first,
      after: endCursor,
      url,
      contentTypePlural,
      contentTypeSingular,
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
