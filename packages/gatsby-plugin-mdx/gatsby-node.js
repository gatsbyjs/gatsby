const crypto = require(`crypto`);
const path = require("path");
//const mdxPlugin = require(".");
const mdx = require("@mdx-js/mdx");

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

  const content = await loadNodeContent(node);

  const markdownNode = {
    id: createNodeId(`${node.id} >>> Mdx`),
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: `Mdx`
    },
    frontmatter: {
      title: ``, // always include a title
      slug: "as",
      _PARENT: node.id
    },
    rawBody: content
  };

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    markdownNode.fileAbsolutePath = node.absolutePath;
    markdownNode.relativePath = node.relativePath;
    markdownNode.fileNode = node;
  }

  markdownNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(markdownNode))
    .digest(`hex`);

  createNode(markdownNode);
  createParentChildLink({ parent: node, child: markdownNode });
};

exports.setFieldsOnGraphQLNodeType = require("./src/set-fields-on-graphql-node-type");

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [loaders.js(), "@mdx-js/loader"]
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

/*exports.createPages =*/ ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMdx(limit: 1000) {
        edges {
          node {
            code
            fileAbsolutePath
            relativePath
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMdx.edges.forEach(({ node }) => {
      console.log(node.relativePath, node.code);
      /* createPage({
       *   path: node.relativePath.slice(0, -4), //node.fileNode.path,
       *   component: mdxPlugin.createComponent(node.relativePath, node.code),
       *   context: {} // additional data can be passed via context
       * });
       */
      /* createPage({
       *   path: node.relativePath.slice(0, -4), //node.fileNode.path,
       *   component: require.resolve(node.fileAbsolutePath),
       *   context: {} // additional data can be passed via context
       * }); */
    });
  });
};

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
