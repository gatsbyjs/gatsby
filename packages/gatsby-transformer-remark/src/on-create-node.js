const grayMatter = require(`gray-matter`)
const { mapValues, isDate } = require(`lodash`)

const generateGraphQLType = require(`./utils/generate-graphql-type`)

const mediaTypes = [`text/markdown`, `text/x-markdown`]

module.exports = async function onCreateNode(helpers, pluginOptions) {
  const {
    node: fileNode,
    actions,
    reporter,
    createNodeId,
    loadNodeContent,
    createContentDigest,
  } = helpers

  if (mediaTypes.includes(fileNode.internal.mediaType)) {
    const fileNodeContent = await loadNodeContent(fileNode)

    try {
      let {
        content,
        excerpt,
        data: frontmatter,
      } = grayMatter(fileNodeContent, pluginOptions)

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

      const node = {
        excerpt,
        frontmatter,
        rawMarkdownBody: content,
      }

      // Add path to the markdown file path
      if (fileNode.internal.type === `File`) {
        node.fileAbsolutePath = fileNode.absolutePath
      }

      actions.createNode({
        ...node,
        id: createNodeId(`${fileNode.id} >>> ${type}`),
        children: [],
        parent: fileNode.id,
        internal: {
          type,
          content,
          contentDigest: createContentDigest(node),
        },
      })

      actions.createParentChildLink({ parent: fileNode, child: node })
    } catch (err) {
      reporter.panicOnBuild(
        `Error processing Markdown ${
          fileNode.absolutePath
            ? `file ${fileNode.absolutePath}`
            : `in node ${fileNode.id}`
        }:\n
      ${err.message}`
      )
    }
  }
}
