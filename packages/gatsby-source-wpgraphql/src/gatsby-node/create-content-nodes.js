const fetch = require(`isomorphic-fetch`)
const url = require(`url`)

const fetchGraphql = async ({ url, query, variables }) =>
  (await fetch(url, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({ query, variables }),
  })).json()

const getPagesQuery = contentTypePlural => `
  # Define our query variables
  query GET_GATSBY_PAGES($first:Int $after:String) {
    ${contentTypePlural}(
        first: $first
        after: $after
      ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            content
            title
            link
            date
            id
          }
      }
  }
`

const fetchContentTypeNodes = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  allContentNodes = [],
  ...variables
}) => {
  const query = getPagesQuery(contentTypePlural)
  const { data } = await fetchGraphql({ url, query, variables })

  const {
    [contentTypePlural]: {
      nodes,
      pageInfo: { hasNextPage, endCursor },
    },
  } = data

  if (nodes) {
    nodes.forEach(node => {
      node.contentType = contentTypeSingular
      node.wpId = node.id
      allContentNodes.push(node)
    })
  }

  if (hasNextPage) {
    return fetchContentTypeNodes({
      first: 10,
      after: endCursor,
      url,
      contentTypePlural,
      contentTypeSingular,
      allContentNodes,
    })
  }

  return allContentNodes
}

const getAvailableContentTypes = () => {
  const contentTypes = [
    {
      plural: `pages`,
      singular: `page`,
    },
    {
      plural: `posts`,
      singular: `post`,
    },
  ]

  return contentTypes
}

const fetchWPGQLContentNodes = async ({ url }) => {
  const contentTypes = getAvailableContentTypes()

  const contentNodeGroups = []

  await Promise.all(
    contentTypes.map(async ({ plural, singular }) => {
      const allNodesOfContentType = await fetchContentTypeNodes({
        first: 10,
        after: null,
        contentTypePlural: plural,
        contentTypeSingular: singular,
        url,
      })

      contentNodeGroups.push({
        singular,
        plural,
        allNodesOfContentType,
      })
    })
  )

  return contentNodeGroups
}

module.exports = async (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const wpgqlNodesByContentType = await fetchWPGQLContentNodes(pluginOptions)

  for (const wpgqlNodesGroup of wpgqlNodesByContentType) {
    const wpgqlNodes = wpgqlNodesGroup.allNodesOfContentType
    for (const [index, node] of wpgqlNodes.entries()) {
      //
      // create a pathname for the node using the WP permalink
      node.path = url.parse(node.link).pathname

      const indexOfLastNode = wpgqlNodes.length - 1
      const indexOfFirstNode = 0

      const previousNodeIndex =
        // if this is the first node
        index === indexOfFirstNode
          ? // use the last node of this post type as the previous
            indexOfLastNode
          : // otherwise use the previous node
            index - 1
      const previousNode = wpgqlNodes[previousNodeIndex]

      const nextNodeIndex =
        // if this is the last node in the content type
        index === indexOfLastNode
          ? // use the first node in the same post type as the next
            indexOfFirstNode
          : // otherwise use the next
            index + 1
      const nextNode = wpgqlNodes[nextNodeIndex]

      // create Gatsby ID's from WPGQL ID's
      const previousNodeId = previousNode
        ? createNodeId(`WpContent-${previousNode.id}`)
        : null
      const nextNodeId = nextNode
        ? createNodeId(`WpContent-${nextNode.id}`)
        : null

      // create connections to adjacent nodes for pagination
      node.pagination = {
        previous___NODE: previousNodeId,
        next___NODE: nextNodeId,
        pageNumber: index + 1,
        isFirst: index === indexOfFirstNode,
        isLast: index === indexOfLastNode,
      }

      await actions.createNode({
        ...node,
        id: createNodeId(`WpContent-${node.id}`),
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: `WpContent`,
        },
      })
    }
  }
}
