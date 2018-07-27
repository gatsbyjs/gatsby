const path = require("path");
const escapeStringRegexp = require("escape-string-regexp");
const defaultOptions = require("./utils/default-options");
const mdx = require("./utils/mdx");

/**
 * Create Mdx nodes from MDX files.
 */
exports.onCreateNode = require("./on-create-node");

/**
 * Add additional fields to MDX nodes
 */
exports.setFieldsOnGraphQLNodeType = require("./extend-node-type");

/**
 * Add the webpack config for loading MDX files
 */
exports.onCreateWebpackConfig = (
  { stage, rules, loaders, plugins, actions },
  pluginOptions
) => {
  const { extensions } = defaultOptions(pluginOptions);
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
  defaultOptions(pluginOptions).extensions;

/**
 * Convert MDX to JSX so that Gatsby can extract the GraphQL queries.
 */
exports.preprocessSource = async function preprocessSource(
  { filename, contents },
  pluginOptions
) {
  const { extensions, ...options } = defaultOptions(pluginOptions);
  const ext = path.extname(filename);

  if (extensions.includes(ext)) {
    const code = await mdx(contents, options);
    return code;
  }
  return null;
};

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-proposal-object-rest-spread`
  });
};
