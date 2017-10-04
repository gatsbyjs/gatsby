const _ = require(`lodash`)

module.exports = async function onCreateNode(
  { node, boundActionCreators },
  { fileExtensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`] }
) {
  const { createNode, createParentChildLink } = boundActionCreators

  if (!_.includes(fileExtensions, node.extension)) {
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
