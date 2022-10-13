const fs = require(`fs`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const NUM_IMAGES = parseInt(process.env.NUM_IMAGES || 100, 10)

const urls = JSON.parse(
  fs.readFileSync(`${__dirname}/urls.json`, `utf-8`)
).slice(0, NUM_IMAGES)

exports.sourceNodes = ({ actions, createNodeId, store, cache }) =>
  Promise.all(
    urls.map(async url => {
      let fileNode
      const nodeId = createNodeId(url)
      try {
        fileNode = await createRemoteFileNode({
          url: url,
          parentNodeId: nodeId,
          cache,
          createNode: actions.createNode,
          createNodeId,
        })
      } catch (e) {
        console.log(e)
        // Ignore
      }

      const node = {
        id: nodeId,
        remoteUrl: url,
        internal: { type: `RemoteImage`, contentDigest: url },
      }

      if (fileNode) {
        node.file___NODE = fileNode.id
      }

      actions.createNode(node)
    })
  )
