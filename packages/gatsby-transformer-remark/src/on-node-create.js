const grayMatter = require(`gray-matter`)
const crypto = require(`crypto`)

module.exports = async function onNodeCreate({
  node,
  getNode,
  loadNodeContent,
  boundActionCreators,
}) {
  const { createNode, updateNode } = boundActionCreators

  // Don't reprocess our own nodes!  (note: this doesn't normally happen
  // but since this transformer creates new nodes with the same media-type
  // as its parent node, we have to add this check that we didn't create
  // the node).
  if (node.type === `MarkdownRemark`) {
    return
  }

  // We only care about markdown content.
  if (node.mediaType !== `text/x-markdown`) {
    return
  }

  const content = await loadNodeContent(node)
  const data = grayMatter(content)
  const contentDigest = crypto.createHash(`md5`).update(JSON.stringify(data))
    .digest(`hex`)
  const markdownNode = {
    id: `${node.id} >>> MarkdownRemark`,
    contentDigest,
    parent: node.id,
    type: `MarkdownRemark`,
    mediaType: `text/x-markdown`,
    children: [],
    content: data.content,
  }
  markdownNode.frontmatter = {
    ...data.data,
    parent: node.id,
  }

  // Add path to the markdown file path
  if (node.type === `File`) {
    markdownNode.fileAbsolutePath = node.absolutePath
  }

  node.children = node.children.concat([markdownNode.id])
  updateNode(node)
  createNode(markdownNode)
}
