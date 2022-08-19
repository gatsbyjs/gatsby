const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async (
  { actions: { createNode, createNodeField }, node, createNodeId, getCache },
  { filter }
) => {
  if (filter(node)) {
    const fileNode = await createRemoteFileNode({
      url: node.url,
      parentNodeId: node.id,
      getCache,
      createNode,
      createNodeId,
    })

    if (fileNode) {
      createNodeField({ node, name: "localFile", value: fileNode.id })
    }
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type UnsplashImagesYaml implements Node {
      url: String
      title: String
      credit: String
      gallery: Boolean
      localFile: File @link(from: "fields.localFile")
    }

  `)
}
