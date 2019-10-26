const fetch = require(`isomorphic-fetch`)
const url = require(`url`)
const _ = require(`lodash`)

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

const allContentNodes = []

const fetchContentTypeNodes = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
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

  const contentNodes = _.flatten(
    await Promise.all(
      contentTypes.map(async ({ plural, singular }) => {
        const allNodesOfContentType = await fetchContentTypeNodes({
          first: 10,
          after: null,
          contentTypePlural: plural,
          contentTypeSingular: singular,
          url,
        })

        return allNodesOfContentType
      })
    )
  )

  return contentNodes
}

module.exports = async (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const wpgqlNodes = await fetchWPGQLContentNodes(pluginOptions)

  await Promise.all(
    wpgqlNodes.map(async (node, index) => {
      //
      // create a pathname for the node using the WP permalink
      node.path = url.parse(node.link).pathname

      const indexOfLastNodeInContentType =
        wpgqlNodes.length -
        [...wpgqlNodes].reverse().findIndex(n => n.type === node.type) -
        1

      const indexOfFirstNodeInContentType = wpgqlNodes.findIndex(
        n => n.type === node.type
      )

      const previousNodeIndex =
        // if this is the first node
        index === 0
          ? // use the last node of this post type as the previous
            indexOfLastNodeInContentType
          : // otherwise use the previous node
            index - 1
      const previousNode = wpgqlNodes[previousNodeIndex]

      const nextNodeIndex =
        // if this is the last node
        index === wpgqlNodes.length - 1
          ? // use the first node in the same post type as the next
            indexOfFirstNodeInContentType
          : // otherwise use the next
            index + 1
      const nextNode = wpgqlNodes[nextNodeIndex]

      // create Gatsby ID's from WPGQL ID's
      const previousNodeId = createNodeId(`WpContent-${previousNode.id}`)
      const nextNodeId = createNodeId(`WpContent-${nextNode.id}`)

      // create connections to adjacent nodes for pagination
      node.pagination = {
        previous___NODE: previousNodeId,
        next___NODE: nextNodeId,
        isFirst: index === indexOfFirstNodeInContentType,
        isLast: index === indexOfLastNodeInContentType,
      }

      return actions.createNode({
        ...node,
        id: createNodeId(`WpContent-${node.id}`),
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: `WpContent`,
        },
      })
    })
  )
}
