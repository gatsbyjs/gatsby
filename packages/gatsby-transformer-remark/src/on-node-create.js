const grayMatter = require(`gray-matter`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

module.exports = async function onCreateNode(
  { node, loadNodeContent, actions, createNodeId, reporter },
  pluginOptions = {}
) {
  const { createNode, createParentChildLink } = actions

  // We only care about markdown content.
  if (
    node.internal.mediaType !== `text/markdown` &&
    node.internal.mediaType !== `text/x-markdown`
  ) {
    return {}
  }

  const content = await loadNodeContent(node)

  try {
    let data = grayMatter(content, pluginOptions)

    if (data.data) {
      data.data = _.mapValues(data.data, value => {
        if (_.isDate(value)) {
          return value.toJSON()
        }
        return value
      })
    }

    let markdownNode = {
      id: createNodeId(`${node.id} >>> MarkdownRemark`),
      children: [],
      parent: node.id,
      internal: {
        content: data.content,
        type: `MarkdownRemark`,
      },
    }

    const baseFrontmatter = {
      title: ``, // always include a title
      ...data.data,
    }

    if (_.isUndefined(pluginOptions.frontmatterDefaults)) {
      pluginOptions.frontmatterDefaults = {}
    } else if (!_.isObject(pluginOptions.frontmatterDefaults)) {
      reporter.warn(`frontmatterDefaults must be an object, defaulting to '{}'`)
      pluginOptions.frontmatterDefaults = {}
    }

    // Assign any default values from the config
    markdownNode.frontmatter = _.defaults(
      baseFrontmatter,
      pluginOptions.frontmatterDefaults
    )
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

    return markdownNode
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing Markdown ${
        node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
      }:\n
      ${err.message}`
    )

    return {} // eslint
  }
}
