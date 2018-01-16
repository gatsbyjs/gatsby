const crypto = require(`crypto`)
const AWS = require(`aws-sdk`)
const _ = require(`lodash`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

var lambda

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

  // Set up the lambda service object based on configuration options

  if (!pluginOptions.lambdaName) {
    console.log(`
gatsby-transformer-screenshot requires a lambdaName option. Please specify
the name of the AWS Lambda function to invoke.
    `)
    process.exit(1)
  }

  const options = {
    params: { FunctionName: pluginOptions.lambdaName },
    apiVersion: `2015-03-31`,
  }

  if (pluginOptions.region) {
    options.region = pluginOptions.region
  }

  if (pluginOptions.credentials) {
    options.credentials = pluginOptions.credentials
  }

  lambda = new AWS.Lambda(options)

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

const getScreenshot = url => {
  const params = {
    Payload: JSON.stringify({ url }),
  }

  return new Promise((resolve, reject) => {
    lambda.invoke(params, (err, data) => {
      if (err) reject(err)
      else {
        const payload = JSON.parse(data.Payload)

        if (
          typeof data.FunctionError === `string` &&
          data.FunctionError.length > 0
        )
          reject(payload)
        resolve(payload)
      }
    })
  })
}

const createScreenshotNode = async ({
  url,
  parent,
  store,
  cache,
  createNode,
}) => {
  const screenshotResponse = await getScreenshot(url)

  const fileNode = await createRemoteFileNode({
    url: screenshotResponse.url,
    store,
    cache,
    createNode,
  })

  const screenshotNode = {
    id: `${parent} >>> Screenshot`,
    url,
    expires: screenshotResponse.expires,
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
