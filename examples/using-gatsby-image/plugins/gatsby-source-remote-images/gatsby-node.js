const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async (
  { actions: { createNode }, node, createContentDigest, store, cache },
  { typeName, nodeName = `localFile` }
) => {
  if (node.internal.type === typeName) {
    const fileNode = await createRemoteFileNode({
      url: node.url,
      store,
      cache,
      createNode,
      createNodeId: createContentDigest,
    })

    if (fileNode) {
      const fileNodeLink = `${nodeName}___NODE`
      node[fileNodeLink] = fileNode.id
    }
  }
}
