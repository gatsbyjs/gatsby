const path = require(`path`)
const mkdirp = require(`mkdirp`)
const { MDX_SCOPES_LOCATION } = require(`./constants`)
const defaultOptions = require(`./utils/default-options`)
const fs = require(`fs`)

/**
 * Create Mdx types and resolvers
 */
exports.sourceNodes = require(`./gatsby/source-nodes`)

/**
 * Create Mdx nodes from MDX files.
 */
exports.onCreateNode = require(`./gatsby/on-create-node`)

/**
 * Add frontmatter as page context for MDX pages
 */
exports.onCreatePage = require(`./gatsby/on-create-page`)

/**
 * Add the webpack config for loading MDX files
 */
exports.onCreateWebpackConfig = require(`./gatsby/create-webpack-config`)

/**
 * Add the MDX extensions as resolvable. This is how the page creator
 * determines which files in the pages/ directory get built as pages.
 */
exports.resolvableExtensions = (data, pluginOptions) =>
  defaultOptions(pluginOptions).extensions

/**
 * Convert MDX to JSX so that Gatsby can extract the GraphQL queries.
 */
exports.preprocessSource = require(`./gatsby/preprocess-source`)

/**
 * Required config for mdx to function
 */
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-object-rest-spread`),
  })
}

exports.onPreBootstrap = ({ cache }) => {
  mkdirp.sync(path.join(cache.directory, MDX_SCOPES_LOCATION))
}

exports.onPostBootstrap = ({ cache }, pluginOptions) => {
  if (pluginOptions.globalScope) {
    fs.writeFileSync(
      path.join(cache.directory, MDX_SCOPES_LOCATION, `global-scope.js`),
      pluginOptions.globalScope
    )
  }
}
