const { supportedExtensions } = require(`./supported-extensions`)

module.exports = async function onCreateNode({ node, actions, createNodeId }) {
  const { createNode, createParentChildLink } = actions

  if (!supportedExtensions[node.extension]) {
    return
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

  createNode(imageNode)
  createParentChildLink({ parent: node, child: imageNode })

  return
}
