import { getPaginatedQuery } from "./graphql-queries"
import fetchGraphql from "../../utils/fetch-graphql"

const paginatedWpNodeFetch = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  query,
  nodeTypeName,
  activity,
  helpers,
  allContentNodes = [],
  ...variables
}) => {
  // skip fetching media items for now
  // if (contentTypePlural === `mediaItems`) {
  //   return allContentNodes
  // }

  const paginatedQuery = getPaginatedQuery(query)

  const response = await fetchGraphql({
    url,
    query: paginatedQuery,
    variables,
  })

  if (response.errors) {
    helpers.reporter.warn(`${nodeTypeName} fetch returned errors`)
    response.errors.forEach(error => {
      helpers.reporter.warn(error.message)
    })

    return null
  }

  const { data } = response

  if (!data[contentTypePlural] || !data[contentTypePlural].nodes) {
    return allContentNodes
  }

  const {
    [contentTypePlural]: {
      nodes,
      pageInfo: { hasNextPage, endCursor },
    },
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
    })
  }

  return allContentNodes
}

export default paginatedWpNodeFetch
