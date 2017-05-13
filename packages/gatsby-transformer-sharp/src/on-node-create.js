const _ = require(`lodash`)

module.exports = async function onNodeCreate({ node, boundActionCreators }) {
  const { createNode, updateNode } = boundActionCreators

  const extensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`, `svg`]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    id: `${node.id} >> ImageSharp`,
    children: [],
    parent: node.id,
    internal: {
      contentDigest: `${node.id}`,
      type: `ImageSharp`,
      mediaType: node.internal.mediaType,
    },
  }

  node.children = node.children.concat([imageNode.id])
  updateNode(node)
  createNode(imageNode)

  return
}
