const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.sourceNodes = async ({
  actions: { createNode },
  getNodeAsync,
  getCache,
  createNodeId,
}) => {
  console.log(getNodeAsync)
  const node = await createNode({
    id: `4`,
    apple: true,
    internal: { contentDigest: `a`, type: `hydrateMe`, hydrated: false },
  })
  console.log(`hi`, node)
  const hydratedNode = await getNodeAsync(`4`)
  console.log(hydratedNode)

  const fileNode = await createRemoteFileNode({
    // The source url of the remote file
    url: `https://unsplash.com/photos/mGfUWmCftzg/download?force=true`,

    // The id of the parent node (i.e. the node to which the new remote File node will be linked to.
    parentNodeId: hydratedNode.id,

    // Gatsby's cache which the helper uses to check if the file has been downloaded already. It's passed to all Node APIs.
    getCache,

    // The action used to create nodes
    createNode,

    // A helper function for creating node Ids
    createNodeId,
  })
  console.log(fileNode)
}

exports.hydrate = async ({ node }) => {
  node.expensiveThing = `done`
  return node
}
