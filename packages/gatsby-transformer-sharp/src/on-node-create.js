const supportedExtensions = {
  jpeg: true,
  jpg: true,
  png: true,
  webp: true,
  tif: true,
  tiff: true,
}

module.exports = async function onCreateNode({ node, actions, createNodeId }) {
  const { createNode, createParentChildLink } = actions

  if (!supportedExtensions[node.extension]) {
    return Promise.resolve()
  }

  const imageNode = {
    id: createNodeId(`${node.id} >> ImageSharp`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest: `${node.internal.contentDigest}`,
      type: `ImageSharp`,
    },
  }

  createParentChildLink({ parent: node, child: imageNode })
  return createNode(imageNode)
}
