const crypto = require(`crypto`)
const axios = require(`axios`)
const _ = require(`lodash`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const SCREENSHOT_ENDPOINT = `https://h7iqvn4842.execute-api.us-east-2.amazonaws.com/prod/screenshot`

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.onPreBootstrap = (
  { store, cache, boundActionCreators },
  pluginOptions
) => {
  const { createNode, touchNode } = boundActionCreators

  // Check for updated screenshots
  // and prevent Gatsby from garbage collecting remote file nodes
  return Promise.all(
    _.values(store.getState().nodes)
      .filter(n => n.internal.type === `Screenshot`)
      .map(async n => {
        if (n.expires && new Date() >= new Date(n.expires)) {
          // Screenshot expired, re-run Lambda
          await createScreenshotNode({
            url: n.url,
            parent: n.parent,
            store,
            cache,
            createNode,
          })
        } else {
          // Screenshot hasn't yet expired, touch the image node
          // to prevent garbage collection
          touchNode(n.screenshotFile___NODE)
        }
      })
  )
}

exports.onCreateNode = async ({ node, boundActionCreators, store, cache }) => {
  const { createNode, createParentChildLink } = boundActionCreators

  // We only care about parsed sites.yaml files
  if (node.internal.type !== `SitesYaml`) {
    return
  }

  const screenshotNode = await createScreenshotNode({
    url: node.url,
    parent: node.id,
    store,
    cache,
    createNode,
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
}) => {
  const screenshotResponse = await axios.post(SCREENSHOT_ENDPOINT, { url })

  const fileNode = await createRemoteFileNode({
    url: screenshotResponse.data.url,
    store,
    cache,
    createNode,
  })

  const screenshotNode = {
    id: `${parent} >>> Screenshot`,
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
}
