const { createContentDigest } = require(`gatsby-core-utils`)

const { findImportsExports } = require(`../utils/gen-mdx`)

async function createMdxNodeWithScope({ id, node, content, ...helpers }) {
  const {
    frontmatter,
    scopeImports,
    scopeExports,
    scopeIdentifiers,
  } = await findImportsExports({
    node,
    rawInput: content,
    absolutePath: node.absolutePath,
    ...helpers,
  })

  const mdxNode = {
    id,
    children: [],
    parent: node.id,
    internal: {
      content,
      type: `Mdx`,
    },
    excerpt: frontmatter.excerpt,
    exports: scopeExports,
    rawBody: content,
    frontmatter: {
      title: ``, // always include a title
      ...frontmatter,
    },
  }

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    mdxNode.fileAbsolutePath = node.absolutePath
  }

  mdxNode.internal.contentDigest = createContentDigest(mdxNode)

  return { mdxNode, scopeIdentifiers, scopeImports }
}

module.exports = createMdxNodeWithScope
