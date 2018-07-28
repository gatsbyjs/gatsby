const crypto = require(`crypto`)
const axios = require(`axios`)
const Queue = require(`better-queue`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const SCREENSHOT_ENDPOINT = `https://h7iqvn4842.execute-api.us-east-2.amazonaws.com/prod/screenshot`
const LAMBDA_CONCURRENCY_LIMIT = 50

const screenshotQueue = new Queue(
  (input, cb) => {
    createScreenshotNode(input)
      .then(r => cb(null, r))
      .catch(e => cb(e))
  },
  { concurrent: LAMBDA_CONCURRENCY_LIMIT, maxRetries: 10, retryDelay: 1000 }
)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.onPreBootstrap = (
  { store, cache, actions, createNodeId, getNodes },
  pluginOptions
) => {
  const { createNode, touchNode } = actions
  const screenshotNodes = getNodes().filter(
    n => n.internal.type === `Screenshot`
  )

  if (screenshotNodes.length === 0) {
    return null
  }

  let anyQueued = false

  // Check for updated screenshots
  // and prevent Gatsby from garbage collecting remote file nodes
  screenshotNodes.forEach(n => {
    if (n.expires && new Date() >= new Date(n.expires)) {
      anyQueued = true
      // Screenshot expired, re-run Lambda
      screenshotQueue.push({
        url: n.url,
        parent: n.parent,
        store,
        cache,
        createNode,
        createNodeId,
      })
    } else {
      // Screenshot hasn't yet expired, touch the image node
      // to prevent garbage collection
      touchNode({ nodeId: n.screenshotFile___NODE })
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

exports.onCreateNode = async ({
  node,
  actions,
  store,
  cache,
  createNodeId,
}) => {
  const { createNode, createParentChildLink } = actions

  // We only care about parsed sites.yaml files with a url field
  if (node.internal.type !== `SitesYaml` || !node.url) {
    return
  }

  const screenshotNode = await new Promise((resolve, reject) => {
    screenshotQueue
      .push({
        url: node.url,
        parent: node.id,
        store,
        cache,
        createNode,
        createNodeId,
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
}

const createScreenshotNode = async ({
  url,
  parent,
  store,
  cache,
  createNode,
  createNodeId,
}) => {
  try {
    const screenshotResponse = await axios.post(SCREENSHOT_ENDPOINT, { url })

    const fileNode = await createRemoteFileNode({
      url: screenshotResponse.data.url,
      store,
      cache,
      createNode,
      createNodeId,
    })

    if (!fileNode) {
      throw new Error(`Remote file node is null`, screenshotResponse.data.url)
    }

    const screenshotNode = {
      id: createNodeId(`${parent} >>> Screenshot`),
      url,
      expires: screenshotResponse.data.expires,
      parent,
      children: [],
      internal: {
        type: `Screenshot`,
      },
      screenshotFile___NODE: fileNode.id,
    }

    screenshotNode.internal.contentDigest = createContentDigest(screenshotNode)

    createNode(screenshotNode)

    return screenshotNode
  } catch (e) {
    console.log(`Failed to screenshot ${url}. Retrying...`)

    throw e
  }
}
