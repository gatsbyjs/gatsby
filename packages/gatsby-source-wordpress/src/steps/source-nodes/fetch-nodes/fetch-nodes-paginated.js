import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"

export const normalizeNode = ({ node, nodeTypeName }) => {
  const normalizedNodeTypeName = node.__typename || nodeTypeName
  // @todo is node.type used anywhere??
  node.type = normalizedNodeTypeName
  // this is used to filter node interfaces by content types
  node.nodeType = normalizedNodeTypeName

  return node
}

/**
 * paginatedWpNodeFetch
 *
 * recursively fetches/paginates remote nodes
 */
const paginatedWpNodeFetch = async ({
  contentTypePlural,
  query,
  nodeTypeName,
  helpers,
  throwFetchErrors = false,
  throwGqlErrors = false,
  allContentNodes = [],
  after = null,
  settings = {},
  headers = {},
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

  const errorContext = `Error occurred while fetching nodes of the "${nodeTypeName}" type.`

  const response = await fetchGraphql({
    query,
    throwFetchErrors,
    throwGqlErrors,
    variables: {
      ...variables,
      after,
    },
    errorContext,
    headers,
  })

  const { data } = response

  if (!data?.[contentTypePlural]?.nodes) {
    return allContentNodes
  }

  let {
    [contentTypePlural]: { nodes, pageInfo: { hasNextPage, endCursor } = {} },
  } = data

  // Sometimes private posts return as null.
  // That causes problems for us so let's strip them out
  nodes = nodes.filter(Boolean)

  if (nodes && nodes.length) {
    nodes.forEach(node => {
      node = normalizeNode({ node, nodeTypeName })
      allContentNodes.push(node)
    })

    // MediaItem type is incremented in createMediaItemNode
    if (nodeTypeName !== `MediaItem`) {
      store.dispatch.logger.incrementActivityTimer({
        typeName: nodeTypeName,
        by: nodes.length,
      })
    }
  }

  if (
    hasNextPage &&
    endCursor &&
    (!settings.limit || settings.limit > allContentNodes.length)
  ) {
    return paginatedWpNodeFetch({
      ...variables,
      contentTypePlural,
      nodeTypeName,
      query,
      allContentNodes,
      helpers,
      settings,
      after: endCursor,
      headers,
    })
  } else {
    return allContentNodes
  }
}

export { paginatedWpNodeFetch }
