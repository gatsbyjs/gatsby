const _ = require("lodash")

async function onNodeCreate({ node, boundActionCreators }) {
  const { createNode, updateNode } = boundActionCreators
  const extensions = ["jpeg", "jpg", "png", "webp", "tif", "tiff", "svg"]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    logical: true,
    id: `${node.id} >> ImageSharp`,
    contentDigest: `${node.id}`,
    parent: node.id,
    type: `ImageSharp`,
    mediaType: node.mediaType,
    children: [],
  }

  node.children = node.children.concat([imageNode.id])
  updateNode(node)
  createNode(imageNode)
}

exports.onNodeCreate = onNodeCreate
