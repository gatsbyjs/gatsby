const crypto = require("crypto");
const debug = require("debug")("gatsby-mdx:utils/create-mdx-node");

const mdx = require("./mdx");
const extractExports = require("./extract-exports");

module.exports = async (
  { node, transform, loadNodeContent, getNode, createNodeId },
  { createNode, createParentChildLink } = {},
  { __internalMdxTypeName, __shouldCreateNode = true, ...options }
) => {
  const nodeType = __internalMdxTypeName || `${node.internal.type}Mdx`;
  debug(`creating node for nodeType \`${nodeType}\``);
  const { meta, content: nodeContent } = await transform({
    node,
    getNode,
    loadNodeContent
  });

  const code = await mdx(nodeContent, options);

  // extract all the exports
  const { frontmatter, ...nodeExports } = extractExports(code);

  const mdxNode = {
    id: createNodeId(`${node.id} >>> ${nodeType}`),
    children: [],
    parent: node.id,
    internal: {
      content: nodeContent,
      type: nodeType
    }
  };

  mdxNode.frontmatter = {
    title: ``, // always include a title
    ...frontmatter,
    _PARENT: node.id
  };

  mdxNode.meta = meta;
  mdxNode.excerpt = frontmatter.excerpt;
  mdxNode.exports = nodeExports;
  mdxNode.rawBody = nodeContent;

  mdxNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(mdxNode))
    .digest(`hex`);

  if (__shouldCreateNode) {
    createNode(mdxNode);
    createParentChildLink({ parent: node, child: mdxNode });
  }
  return mdxNode;
};
