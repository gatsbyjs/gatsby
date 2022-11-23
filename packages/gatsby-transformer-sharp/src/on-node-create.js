const { supportedExtensions } = require(`./supported-extensions`)

function shouldOnCreateNode({ node }) {
  return node.internal.type === `File` && !!supportedExtensions[node.extension]
}

module.exports.shouldOnCreateNode = shouldOnCreateNode

module.exports.onCreateNode = async function onCreateNode({
  node,
  actions,
  createNodeId,
}) {
  const { createNode, createParentChildLink } = actions

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
