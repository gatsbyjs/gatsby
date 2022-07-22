const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const WebSocket = require("ws")
const {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} = require("@apollo/client")
const { WebSocketLink } = require("@apollo/client/link/ws")
const { getMainDefinition } = require("@apollo/client/utilities")
const fetch = require("node-fetch")
const gql = require("graphql-tag")

/**
 * ============================================================================
 * Create a GraphQL client to subscribe to live data changes
 * ============================================================================
 */

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://localhost:4000",
  fetch,
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
  },
  webSocketImpl: WebSocket,
})

// using the ability to split links, you can send data to each link/url
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

/**
 * ============================================================================
 * Helper functions and constants
 * ============================================================================
 */

const POST_NODE_TYPE = `Post`
const AUTHOR_NODE_TYPE = `Author`

// helper function for creating nodes
const createNodeFromData = (item, nodeType, helpers) => {
  const nodeMetadata = {
    id: helpers.createNodeId(`${nodeType}-${item.id}`),
    parent: null, // this is used if nodes are derived from other nodes, a little different than a foreign key relationship, more fitting for a transformer plugin that is changing the node
    children: [],
    internal: {
      type: nodeType,
      content: JSON.stringify(item),
      contentDigest: helpers.createContentDigest(item),
    },
  }

  const node = Object.assign({}, item, nodeMetadata)
  helpers.createNode(node)
  return node
}

/**
 * ============================================================================
 * Verify plugin loads
 * ============================================================================
 */

// should see message in console when running `gatsby develop` in example-site
exports.onPreInit = () => console.log("Loaded source-plugin")

/**
 * ============================================================================
 * Link nodes together with a customized GraphQL Schema
 * ============================================================================
 */

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type Post implements Node {
      id: ID!
      slug: String!
      description: String!
      imgUrl: String!
      imgAlt: String!
      # create relationships between Post and File nodes for optimized images
      remoteImage: File @link
      # create relationships between Post and Author nodes
      author: Author @link(from: "author.name" by: "name")
    }

    type Author implements Node {
      id: ID!
      name: String!
    }`)
}

/**
 * ============================================================================
 * Source and cache nodes from the API
 * ============================================================================
 */

exports.sourceNodes = async function sourceNodes(
  {
    actions,
    cache,
    createContentDigest,
    createNodeId,
    getNodesByType,
    getNode,
  },
  pluginOptions
) {
  const { createNode, touchNode, deleteNode } = actions
  const helpers = Object.assign({}, actions, {
    createContentDigest,
    createNodeId,
  })

  // you can access plugin options here if need be
  console.log(`Space ID: ${pluginOptions.spaceId}`)

  // simple caching example, you can find in .cache/caches/source-plugin/some-diskstore
  await cache.set(`hello`, `world`)
  console.log(await cache.get(`hello`))

  // touch nodes to ensure they aren't garbage collected
  getNodesByType(POST_NODE_TYPE).forEach(node => touchNode(node))
  getNodesByType(AUTHOR_NODE_TYPE).forEach(node => touchNode(node))

  // listen for updates using subscriptions from the API
  if (pluginOptions.preview) {
    console.log(
      "Subscribing to updates on ws://localhost:4000 (plugin is in Preview mode)"
    )
    const subscription = await client.subscribe({
      query: gql`
        subscription {
          posts {
            id
            slug
            description
            imgUrl
            imgAlt
            author {
              id
              name
            }
            status
          }
        }
      `,
    })
    subscription.subscribe(({ data }) => {
      console.log(`Subscription received:`)
      console.log(data.posts)
      data.posts.forEach(post => {
        const nodeId = createNodeId(`${POST_NODE_TYPE}-${post.id}`)
        switch (post.status) {
          case "deleted":
            deleteNode(getNode(nodeId))
            break
          case "created":
          case "updated":
          default:
            // created and updated can be handled by the same code path
            // the post's id is presumed to stay constant (or can be inferred)
            createNodeFromData(post, POST_NODE_TYPE, helpers)
            break
        }
      })
    })
  }

  // store the response from the API in the cache
  const cacheKey = "your-source-data-key"
  let sourceData = await cache.get(cacheKey)

  // fetch fresh data if nothing is found in the cache or a plugin option says not to cache data
  if (!sourceData || !pluginOptions.cacheResponse) {
    console.log("Not using cache for source data, fetching fresh content")
    const { data } = await client.query({
      query: gql`
        query {
          posts {
            id
            slug
            description
            imgUrl
            imgAlt
            author {
              id
              name
            }
          }
          authors {
            id
            name
          }
        }
      `,
    })
    await cache.set(cacheKey, data)
    sourceData = data
  }

  // loop through data returned from the api and create Gatsby nodes for them
  sourceData.posts.forEach(post =>
    createNodeFromData(post, POST_NODE_TYPE, helpers)
  )
  sourceData.authors.forEach(author =>
    createNodeFromData(author, AUTHOR_NODE_TYPE, helpers)
  )

  return
}

/**
 * ============================================================================
 * Transform remote file nodes
 * ============================================================================
 */

exports.onCreateNode = async ({
  actions: { createNode },
  getCache,
  createNodeId,
  node,
}) => {
  // transform remote file nodes using Gatsby sharp plugins
  // because onCreateNode is called for all nodes, verify that you are only running this code on nodes created by your plugin
  if (node.internal.type === POST_NODE_TYPE) {
    // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
    const fileNode = await createRemoteFileNode({
      // the url of the remote image to generate a node for
      url: node.imgUrl,
      getCache,
      createNode,
      createNodeId,
      parentNodeId: node.id,
    })

    if (fileNode) {
      // used to add a field `remoteImage` to the Post node from the File node in the schemaCustomization API
      node.remoteImage = fileNode.id

      // inference can link these without schemaCustomization like this, but creates a less sturdy schema
      // node.remoteImage___NODE = fileNode.id
    }
  }
}
