const _ = require(`lodash`)

module.exports = async function onCreateNode({ node, boundActionCreators }, pluginOptions) {
  const { createNode, createParentChildLink } = boundActionCreators
  const defaultOptions = {
    fileExtensions: [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`],
  }
  const options = _.defaults(pluginOptions, defaultOptions)

  if (!_.includes(options.fileExtensions, node.extension)) {
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
