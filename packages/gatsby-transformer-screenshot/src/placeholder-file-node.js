const path = require(`path`)
const { createFileNode } = require(`gatsby-source-filesystem/create-file-node`)

let placeholderFileNode
const getPlaceholderFileNode = async ({ createNode, createNodeId }) => {
  if (!placeholderFileNode) {
    const fileNode = await createFileNode(
      path.join(__dirname, `placeholder.png`),
      createNodeId,
      {}
    )
    createNode(fileNode, { name: `gatsby-source-filesystem` })
    placeholderFileNode = fileNode
  }

  return placeholderFileNode
}

module.exports = getPlaceholderFileNode
