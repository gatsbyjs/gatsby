const crypto = require("crypto");
const path = require("path");
const merge = require("lodash.merge");
const escapeStringRegexp = require("escape-string-regexp");
const mdx = require("./utils/mdx");
const extractExports = require("./utils/extract-exports");

const defaultExtensions = [".mdx"];

/**
 * Create Mdx nodes from MDX files.
 */
exports.onCreateNode = async function onCreateNode(
  { node, getNode, loadNodeContent, actions, createNodeId },
  pluginOptions
) {
  const extensions = pluginOptions.extensions || defaultExtensions;
  const { createNode, createParentChildLink } = actions;

  // We only care about markdown content.
  // replace with mediaType when mime-db is merged
  //    node.internal.mediaType !== `text/mdx`
  if (!extensions.includes(node.ext)) {
    return;
  }

  const nodeContent = await loadNodeContent(node);
  const code = await mdx(nodeContent);

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
    },
    frontmatter: {
      title: ``, // always include a title
      ...frontmatter,
      _PARENT: node.id
    },
    exports: nodeExports,
    rawBody: nodeContent
  };

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

exports.setFieldsOnGraphQLNodeType = require("./extend-node-type");

exports.onCreateWebpackConfig = (
  { stage, rules, loaders, plugins, actions },
  pluginOptions
) => {
  const extensions = pluginOptions.extensions || defaultExtensions;
  const testPattern = new RegExp(
    extensions.map(ext => `${escapeStringRegexp(ext)}$`).join("|")
  );

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: testPattern,
          use: [
            loaders.js(),
            {
              loader: "gatsby-mdx/mdx-loader",
              options: pluginOptions
            }
          ]
        }
      ]
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`
      })
    ]
  });
};

/**
 * Add the MDX extensions as resolvable. This is how the page creator
 * determines which files in the pages/ directory get built as pages.
 */
exports.resolvableExtensions = (data, pluginOptions) =>
  pluginOptions.extensions || defaultExtensions;

/**
 * Convert MDX to JSX so that Gatsby can extract the GraphQL queries.
 */
exports.preprocessSource = async function preprocessSource(
  { filename, contents },
  pluginOptions
) {
  const extensions = pluginOptions.extensions || defaultExtensions;
  const ext = path.extname(filename);

  if (extensions.includes(ext)) {
    const code = await mdx(contents, pluginOptions);
    return code;
  }
  return null;
};
