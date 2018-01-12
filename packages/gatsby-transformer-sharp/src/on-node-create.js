const _ = require(`lodash`)

module.exports = async function onCreateNode({ node, actions }) {
  const { createNode, createParentChildLink } = actions

  const extensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`]
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
