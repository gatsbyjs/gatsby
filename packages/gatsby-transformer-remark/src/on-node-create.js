const grayMatter = require(`gray-matter`)
const crypto = require(`crypto`)

module.exports = async function onCreateNode(
  { node, loadNodeContent, actions, createNodeId, reporter },
  {
    plugins = null,
    filter = () => true,
    type = `MarkdownRemark`,
    ...grayMatterOptions
  } = {}
) {
  const { createNode, createParentChildLink } = actions

  // We only care about markdown content.
  if (
    (node.internal.mediaType !== `text/markdown` &&
      node.internal.mediaType !== `text/x-markdown`) ||
    !filter(node)
  ) {
    return
  }

  const content = await loadNodeContent(node)

  try {
    const data = grayMatter(content, grayMatterOptions)

    const markdownNode = {
      id: createNodeId(`${node.id} >>> ${type}`),
      children: [],
      parent: node.id,
      internal: {
        content: data.content,
        type,
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
