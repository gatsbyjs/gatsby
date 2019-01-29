const grayMatter = require(`gray-matter`)
const crypto = require(`crypto`)

module.exports = async function onCreateNode(
  { node, loadNodeContent, actions, createNodeId, reporter },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  // We only care about markdown content.
  if (
    node.internal.mediaType !== `text/markdown` &&
    node.internal.mediaType !== `text/x-markdown`
  ) {
    return
  }

  const content = await loadNodeContent(node)

  try {
    const data = grayMatter(content, pluginOptions)

    const markdownNode = {
      id: createNodeId(`${node.id} >>> MarkdownRemark`),
      children: [],
      parent: node.id,
      internal: {
        content: data.content,
        type: `MarkdownRemark`,
      },
    }

    markdownNode.frontmatter = {
      title: ``, // always include a title
      ...data.data,
    }

    markdownNode.excerpt = data.excerpt
    markdownNode.rawMarkdownBody = data.content

    // Add path to the markdown file path
    if (node.internal.type === `File`) {
      markdownNode.fileAbsolutePath = node.absolutePath
    }

    markdownNode.internal.contentDigest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(markdownNode))
      .digest(`hex`)

    createNode(markdownNode)
    createParentChildLink({ parent: node, child: markdownNode })
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing Markdown ${
        node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
      }:\n
      ${err.message}`
    )
  }
}
