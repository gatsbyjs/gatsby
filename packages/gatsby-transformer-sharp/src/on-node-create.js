const { supportedExtensions } = require(`./supported-extensions`)

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.type === `File` && !!supportedExtensions[node.extension]
}

module.exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

module.exports.onCreateNode = async function onCreateNode({
  node,
  actions,
  createNodeId,
}) {
  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

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
