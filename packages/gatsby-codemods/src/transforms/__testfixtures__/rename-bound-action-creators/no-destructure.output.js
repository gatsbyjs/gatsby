const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = arg => {
  const { node, getNode } = arg
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    arg.actions.createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}