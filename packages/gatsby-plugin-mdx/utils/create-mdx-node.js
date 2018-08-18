const crypto = require("crypto");
const mdx = require("./mdx");
const extractExports = require("./extract-exports");

module.exports = async (
  { node, transform, getNode, createNodeId },
  { createNode, createParentChildLink },
  options
) => {
  const { meta, content: nodeContent } = transform({ node, getNode });

  const code = await mdx(nodeContent, options);

  // extract all the exports
  const { frontmatter, ...nodeExports } = extractExports(code);

  const mdxNode = {
    id: createNodeId(`${node.id} >>> ${node.internal.type}Mdx`),
    children: [],
    parent: node.id,
    internal: {
      content: nodeContent,
      type: `${node.internal.type}Mdx`
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

  createNode(mdxNode);
  createParentChildLink({ parent: node, child: mdxNode });
  return mdxNode;
};
