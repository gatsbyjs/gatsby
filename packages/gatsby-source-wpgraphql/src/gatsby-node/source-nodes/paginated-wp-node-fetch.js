const { getPaginatedQuery } = require(`./graphql-queries`)
const fetchGraphql = require(`../../utils/fetch-graphql`)
const { dd } = require(`dumper.js`)
const paginatedWpNodeFetch = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  query,
  nodeTypeName,
  allContentNodes = [],
  ...variables
}) => {
  // skip fetching media items for now
  if (contentTypePlural === `mediaItems`) {
    return allContentNodes
  }

  const paginatedQuery = getPaginatedQuery(query)

  const response = await fetchGraphql({
    url,
    query: paginatedQuery,
    variables,
  })

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
    })
  }

  return allContentNodes
}

module.exports = paginatedWpNodeFetch
