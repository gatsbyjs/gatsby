const { supportedExtensions } = require(`./supported-extensions`)

function onCreateNodeSyncTest(node) {
  return !!supportedExtensions[node.extension]
}

module.exports.onCreateNode = async function onCreateNode({
  node,
  actions,
  createNodeId,
}) {
  const { createNode, createParentChildLink } = actions

  if (!onCreateNodeSyncTest(node)) {
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

module.exports.onCreateNodeSyncTest = onCreateNodeSyncTest
