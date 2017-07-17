const _ = require(`lodash`)

module.exports = async function onCreateNode({ node, boundActionCreators }) {
  const { createNode, createParentChildLink } = boundActionCreators

  const extensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`, `svg`]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    id: `${node.id} >> ImageSharp`,
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
