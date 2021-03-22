const axios = require(`axios`)
const Queue = require(`better-queue`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const SCREENSHOT_ENDPOINT = `https://h7iqvn4842.execute-api.us-east-2.amazonaws.com/prod/screenshot`
const LAMBDA_CONCURRENCY_LIMIT = 50
const USE_PLACEHOLDER_IMAGE = process.env.GATSBY_SCREENSHOT_PLACEHOLDER

const screenshotQueue = new Queue(
  (input, cb) => {
    createScreenshotNode(input)
      .then(r => cb(null, r))
      .catch(e => cb(e))
  },
  { concurrent: LAMBDA_CONCURRENCY_LIMIT, maxRetries: 3, retryDelay: 1000 }
)

exports.onPreBootstrap = (
  {
    store,
    cache,
    actions,
    createNodeId,
    getCache,
    getNode,
    getNodesByType,
    createContentDigest,
    reporter,
  },
  pluginOptions
) => {
  const { createNode, touchNode } = actions
  const screenshotNodes = getNodesByType(`Screenshot`)

  if (screenshotNodes.length === 0) {
    return null
  }

  let anyQueued = false

  // Check for updated screenshots and placeholder flag
  // and prevent Gatsby from garbage collecting remote file nodes
  screenshotNodes.forEach(n => {
    if (
      (n.expires && new Date() >= new Date(n.expires)) ||
      USE_PLACEHOLDER_IMAGE !== n.usingPlaceholder
    ) {
      anyQueued = true
      // Screenshot expired, re-run Lambda
      screenshotQueue.push({
        url: n.url,
        parent: n.parent,
        store,
        cache,
        createNode,
        createNodeId,
        getCache,
        parentNodeId: n.id,
        createContentDigest,
        reporter,
      })
    } else {
      // Screenshot hasn't yet expired, touch the image node
      // to prevent garbage collection
      touchNode(getNode(n.screenshotFile___NODE))
    }
  })

  if (!anyQueued) {
    return null
  }

  return new Promise((resolve, reject) => {
    screenshotQueue.on(`drain`, () => {
      resolve()
    })
  })
}

function unstable_shouldOnCreateNode({ node }, pluginOptions) {
  /*
   * Check if node is of a type we care about, and has a url field
   * (originally only checked sites.yml, hence including by default)
   */
  const validNodeTypes = [`SitesYaml`].concat(pluginOptions.nodeTypes || [])
  return validNodeTypes.includes(node.internal.type) && node.url
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

exports.onCreateNode = async (
  { node, actions, store, cache, createNodeId, createContentDigest, getCache },
  pluginOptions
) => {
  if (!unstable_shouldOnCreateNode({ node }, pluginOptions)) {
    return
  }

  const { createNode, createParentChildLink } = actions

  try {
    const screenshotNode = await new Promise((resolve, reject) => {
      screenshotQueue
        .push({
          url: node.url,
          parent: node.id,
          store,
          cache,
          createNode,
          createNodeId,
          getCache,
          createContentDigest,
          parentNodeId: node.id,
        })
        .on(`finish`, r => {
          resolve(r)
        })
        .on(`failed`, e => {
          reject(e)
        })
    })

    createParentChildLink({
      parent: node,
      child: screenshotNode,
    })
  } catch (e) {
    return
  }
}

const createScreenshotNode = async ({
  url,
  parent,
  store,
  cache,
  createNode,
  createNodeId,
  getCache,
  parentNodeId,
  createContentDigest,
  reporter,
}) => {
  try {
    let fileNode
    let expires
    if (USE_PLACEHOLDER_IMAGE) {
      const getPlaceholderFileNode = require(`./placeholder-file-node`)
      fileNode = await getPlaceholderFileNode({
        createNode,
        createNodeId,
      })
      expires = new Date(2999, 1, 1).getTime()
    } else {
      const screenshotResponse = await axios.post(SCREENSHOT_ENDPOINT, { url })

      fileNode = await createRemoteFileNode({
        url: screenshotResponse.data.url,
        store,
        cache,
        createNode,
        createNodeId,
        getCache,
        parentNodeId,
        reporter,
      })
      expires = screenshotResponse.data.expires

      if (!fileNode) {
        throw new Error(`Remote file node is null`, screenshotResponse.data.url)
      }
    }

    const screenshotNode = {
      id: createNodeId(`${parent} >>> Screenshot`),
      url,
      expires,
      parent,
      children: [],
      internal: {
        type: `Screenshot`,
      },
      screenshotFile___NODE: fileNode.id,
      usingPlaceholder: USE_PLACEHOLDER_IMAGE,
    }

    screenshotNode.internal.contentDigest = createContentDigest(screenshotNode)

    createNode(screenshotNode)

    return screenshotNode
  } catch (e) {
    console.log(`Failed to screenshot ${url}. Retrying...`)

    throw e
  }
}
