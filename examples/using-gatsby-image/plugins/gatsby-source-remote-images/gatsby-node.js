const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async (
  {
    actions: { createNode },
    node,
    createContentDigest,
    store,
    cache,
    reporter,
  },
  { filter, nodeName = `localFile` }
) => {
  if (filter(node)) {
    const fileNode = await createRemoteFileNode({
      url: node.url,
      store,
      cache,
      createNode,
      createNodeId: createContentDigest,
      reporter,
    })

    if (fileNode) {
      const fileNodeLink = `${nodeName}___NODE`
      node[fileNodeLink] = fileNode.id
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
      localFile: File @link(from: "localFile___NODE")
    }

  `)
}
