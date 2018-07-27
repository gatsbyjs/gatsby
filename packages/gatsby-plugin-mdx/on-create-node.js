const crypto = require("crypto");
const merge = require("lodash/merge");
const defaultOptions = require("./utils/default-options");
const mdx = require("./utils/mdx");
const extractExports = require("./utils/extract-exports");

module.exports = async (
  { node, getNode, loadNodeContent, actions, createNodeId },
  pluginOptions
) => {
  const { extensions, ...options } = defaultOptions(pluginOptions);
  const { createNode, createParentChildLink } = actions;

  // We only care about markdown content.
  // replace with mediaType when mime-db is merged
  //    node.internal.mediaType !== `text/mdx`
  if (!extensions.includes(node.ext)) {
    return;
  }

  const nodeContent = await loadNodeContent(node);
  const code = await mdx(nodeContent, options);

  // extract all the exports
  const nodeExports = extractExports(code);

  // grab the frontmatter
  const classicFrontmatter = nodeExports._frontmatter || {};
  const exportFrontmatter = nodeExports.frontmatter || {};

  // // delete the frontmatter from the exports
  delete nodeExports._frontmatter;
  delete nodeExports.frontmatter;

  const frontmatter = merge(classicFrontmatter, exportFrontmatter);

  const mdxNode = {
    id: createNodeId(`${node.id} >>> Mdx`),
    children: [],
    parent: node.id,
    internal: {
      content: nodeContent,
      type: `Mdx`
    }
  };

  mdxNode.frontmatter = {
    title: ``, // always include a title
    ...frontmatter,
    _PARENT: node.id
  };

  mdxNode.excerpt = frontmatter.excerpt;
  mdxNode.exports = nodeExports;
  mdxNode.rawBody = nodeContent;

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    mdxNode.fileAbsolutePath = node.absolutePath;
    mdxNode.relativePath = node.relativePath;
    mdxNode.fileNode = node;
  }

  mdxNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(mdxNode))
    .digest(`hex`);

  createNode(mdxNode);
  createParentChildLink({ parent: node, child: mdxNode });
};
