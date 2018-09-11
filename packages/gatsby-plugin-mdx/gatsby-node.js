const path = require("path");
const defaultOptions = require("./utils/default-options");
const mdx = require("./utils/mdx");

/**
 * Create Mdx nodes from MDX files.
 */
exports.onCreateNode = require("./gatsby/on-create-node");

/**
 * Add additional fields to MDX nodes
 */
exports.setFieldsOnGraphQLNodeType = require("./gatsby/extend-node-type");

/**
 * Add frontmatter as page context for MDX pages
 */
exports.onCreatePage = require("./gatsby/on-create-page");

/**
 * Add the webpack config for loading MDX files
 */
exports.onCreateWebpackConfig = require("./gatsby/create-webpack-config");

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

/**
 * Required config for mdx to function
 */
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-proposal-object-rest-spread`
  });
};
