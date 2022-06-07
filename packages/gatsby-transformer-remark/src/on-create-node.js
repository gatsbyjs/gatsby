const grayMatter = require(`gray-matter`)
const { mapValues, isDate } = require(`lodash`)

const generateGraphQLType = require(`./utils/generate-graphql-type`)

const mediaTypes = [`text/markdown`, `text/x-markdown`]

module.exports = async function onCreateNode(helpers, pluginOptions) {
  const {
    node,
    actions,
    reporter,
    createNodeId,
    loadNodeContent,
    createContentDigest,
  } = helpers

  if (mediaTypes.includes(node.internal.mediaType)) {
    const nodeContent = await loadNodeContent(node)

    try {
      let {
        content,
        excerpt,
        data: frontmatter,
      } = grayMatter(nodeContent, pluginOptions)

      if (frontmatter) {
        frontmatter = mapValues(frontmatter, value => {
          if (isDate(value)) {
            return value.toJSON()
          }
          return value
        })

        frontmatter.title = frontmatter.title || ``
      }

      const type = await generateGraphQLType(
        helpers,
        pluginOptions,
        frontmatter
      )

      const id = createNodeId(`${node.id} >>> ${type}`)

      const markdownNode = {
        id,
        excerpt,
        frontmatter,
        rawMarkdownBody: content,
        children: [],
        parent: node.id,
        internal: {
          type,
          content,
        },
      }

      // Add path to the markdown file path
      if (node.internal.type === `File`) {
        markdownNode.fileAbsolutePath = node.absolutePath
      }

      markdownNode.internal.contentDigest = createContentDigest(markdownNode)

      actions.createNode(markdownNode)
      actions.createParentChildLink({ parent: node, child: markdownNode })
    } catch (err) {
      reporter.panicOnBuild(
        `Error processing Markdown ${
          node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
        }:\n
      ${err.message}`
      )
    }
  }
}
