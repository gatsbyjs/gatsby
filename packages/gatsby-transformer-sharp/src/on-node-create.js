const supportedExtensions = {
  jpeg: true,
  jpg: true,
  png: true,
  webp: true,
  tif: true,
  tiff: true,
}

module.exports = async function onCreateNode({
  node,
  actions,
  createNodeId,
  reporter,
}) {
  const { createNode, createParentChildLink } = actions

  if (!supportedExtensions[node.extension]) {
    if (node.extension === `gif`) {
      reporter.warn(
        `The file "${node.absolutePath}" wasn't processed by gatsby-transformer-sharp as "${node.extension}" is currently not supported.\n\nPlease use "publicURL" in your query and a normal img tag in your React component instead.\nOtherwise you'll receive "null" for your "childImageSharp" query. You could also check for a truthy value of "childImageSharp" before using e.g. gatsby-image.`
      )
    }
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
