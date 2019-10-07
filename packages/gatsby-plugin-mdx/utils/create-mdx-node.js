const crypto = require(`crypto`)
const mdx = require(`../utils/mdx`)
const extractExports = require(`../utils/extract-exports`)

module.exports = async ({ id, node, content }) => {
  let code
  try {
    code = await mdx(content)
  } catch (e) {
    // add the path of the file to simplify debugging error messages
    e.message += `${node.absolutePath}: ${e.message}`
    throw e
  }

  // extract all the exports
  const { frontmatter, ...nodeExports } = extractExports(code)

  const mdxNode = {
    id,
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: `Mdx`,
    },
  }

  mdxNode.frontmatter = {
    title: ``, // always include a title
    ...frontmatter,
  }

  mdxNode.excerpt = frontmatter.excerpt
  mdxNode.exports = nodeExports
  mdxNode.rawBody = content

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    mdxNode.fileAbsolutePath = node.absolutePath
  }

  mdxNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(mdxNode))
    .digest(`hex`)

  return mdxNode
}
