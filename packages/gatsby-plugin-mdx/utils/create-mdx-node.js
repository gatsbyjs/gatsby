const crypto = require("crypto");
const mdx = require("../utils/mdx");
const extractExports = require("../utils/extract-exports");

module.exports = async ({ id, node, content }) => {
  const code = await mdx(content);

  // extract all the exports
  const { frontmatter, ...nodeExports } = extractExports(code);

  const mdxNode = {
    id,
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: "Mdx"
    }
  };

  mdxNode.frontmatter = {
    title: ``, // always include a title
    ...frontmatter,
    _PARENT: node.id
  };

  mdxNode.excerpt = frontmatter.excerpt;
  mdxNode.exports = nodeExports;
  mdxNode.rawBody = content;

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    mdxNode.fileAbsolutePath = node.absolutePath;
  }

  mdxNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(mdxNode))
    .digest(`hex`);

  return mdxNode;
};
