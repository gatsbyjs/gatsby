import fetchGraphql from "~/utils/fetch-graphql"
import { getStore } from "~/store"
import { formatLogMessage } from "../../../utils/format-log-message"

export const normalizeNode = ({ node, nodeTypeName }) => {
  const normalizedNodeTypeName = node.__typename || nodeTypeName
  // @todo is node.type used anywhere??
  node.type = normalizedNodeTypeName
  // this is used to filter node interfaces by content types
  node.nodeType = normalizedNodeTypeName

  return node
}

// this is used to determine wether we've already seen an id
// for cold builds.
// the reason we want to do this is to detect if we create 2 nodes with the same id
// if we do there will be less nodes in Gatsby than in WP and users will be confused.
const idSet = new Set()
let hasLoggedDuplicateMessage = false

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
    [contentTypePlural]: { nodes, pageInfo },
  } = data

  const { hasNextPage, endCursor } = pageInfo || {}

  // Sometimes private posts return as null.
  // That causes problems for us so let's strip them out
  nodes = nodes.filter(Boolean)

  if (nodes && nodes.length) {
    nodes.forEach(node => {
      const existingId = idSet.has(node.id)

      if (
        existingId &&
        // when the since variable is present
        // we're fetching lists of node updates from WPGQL
        // in that case we don't need to worry about logging duplicates
        !(`since` in variables)
      ) {
        const existingNode = allContentNodes.find(
          innerNode => innerNode.id === node.id
        )

        if (existingNode) {
          if (!hasLoggedDuplicateMessage) {
            hasLoggedDuplicateMessage = true
            helpers.reporter.warn(
              formatLogMessage(
                `Found a duplicate ID in WordPress - this means you will have fewer nodes in Gatsby than in WordPress. This will need to be resolved in WP by identifying and fixing the underlying bug with your WP plugins or custom code.`
              )
            )
          }

          if (node?.databaseId && node?.uri && existingNode?.uri) {
            helpers.reporter.info(
              formatLogMessage(
                `Node with ID ${node.databaseId}/${node.id} of type ${node.__typename} was fetched multiple times. This is a WPGraphQL bug where pagination returns duplicate nodes.`
              )
            )
          }
        }
      } else {
        idSet.add(node.id)
      }

      node = normalizeNode({ node, nodeTypeName })
      allContentNodes.push(node)
    })

    // MediaItem type is incremented in createMediaItemNode
    if (nodeTypeName !== `MediaItem`) {
      getStore().dispatch.logger.incrementActivityTimer({
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
