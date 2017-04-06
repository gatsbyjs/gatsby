const _ = require("lodash")

async function onNodeCreate({ node, actionCreators }) {
  const { createNode, updateNode } = actionCreators
  const extensions = ["jpeg", "jpg", "png", "webp", "tif", "tiff", "svg"]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    _sourceNodeId: node.id,
    parent: node.id,
    type: `ImageSharp`,
    id: `${node.id} >> ImageSharp`,
    children: [],
  }

  node.children = node.children.concat([imageNode.id])
  updateNode(node)
  createNode(imageNode)
}

exports.onNodeCreate = onNodeCreate
