const crypto = require(`crypto`);
const path = require("path");
//const mdxPlugin = require(".");
const mdx = require("@mdx-js/mdx");
const matter = require("gray-matter");

exports.onCreateNode = async function onCreateNode(
  { node, getNode, loadNodeContent, actions, createNodeId },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions;

  // We only care about markdown content.
  if (
    // replace with mediaType when mime-db is merged
    //    node.internal.mediaType !== `text/mdx`
    node.ext !== ".mdx"
  ) {
    return;
  }

  const nodeContent = await loadNodeContent(node);
  const { content, data } = matter(nodeContent);

  const mdxNode = {
    id: createNodeId(`${node.id} >>> Mdx`),
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: `Mdx`
    },
    frontmatter: {
      title: ``, // always include a title
      ...data,
      _PARENT: node.id
    },
    rawBody: content
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

exports.setFieldsOnGraphQLNodeType = require("./src/set-fields-on-graphql-node-type");

exports.onCreateWebpackConfig = (
  { stage, rules, loaders, plugins, actions },
  pluginOptions
) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [
            loaders.js(),
            {
              loader: "gatsby-mdx/mdx-options-loader",
              options: pluginOptions
            },
            //            "@mdx-js/loader",
            "gatsby-mdx/frontmatter-to-exports-loader"
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

exports.resolvableExtensions = () => [`.mdx`];

exports.preprocessSource = function preprocessSource(
  { filename, contents },
  pluginOptions
) {
  if (/\.mdx$/.test(filename)) {
    const code = mdx.sync(contents /*, pluginOptions*/);
    return code;
  }
  return null;
};
