const path = require(`path`)
const mkdirp = require(`mkdirp`)
const { MDX_SCOPES_LOCATION } = require(`./constants`)
const defaultOptions = require(`./utils/default-options`)
const fs = require(`fs`)

const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./gatsby/on-create-node`)

/**
 * Create Mdx types and resolvers
 */
exports.sourceNodes = require(`./gatsby/source-nodes`)

/**
 * Check whether to create Mdx nodes from MDX files.
 */
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

/**
 * Create Mdx nodes from MDX files.
 */
exports.onCreateNode = onCreateNode

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

exports.pluginOptionsSchema = function ({ Joi }) {
  return Joi.object({
    extensions: Joi.array()
      .items(Joi.string())
      .default([".mdx"])
      .description(
        `Configure the file extensions that gatsby-plugin-mdx will process`
      ),
    defaultLayouts: Joi.object({})
      .unknown(true)
      .default({})
      .description(`Set the layout components for MDX source types`),
    gatsbyRemarkPlugins: Joi.array()
      .items(
        Joi.string(),
        Joi.object({
          resolve: Joi.string(),
          options: Joi.object({}).unknown(true),
        })
      )
      .default([])
      .description(`Use Gatsby-specific remark plugins`),
    lessBabel: Joi.boolean()
      .default(false)
      .description(
        "Enable fast parsing mode? This may break certain implied transformation dependencies. Disable if you have problems"
      ),
    remarkPlugins: Joi.array()
      .items(
        Joi.function(),
        Joi.object({}).unknown(true),
        Joi.array().items(Joi.object({}).unknown(true), Joi.function())
      )
      .default([])
      .description(`Specify remark plugins`),
    rehypePlugins: Joi.array()
      .items(
        Joi.function(),
        Joi.object({}).unknown(true),
        Joi.array().items(Joi.object({}).unknown(true), Joi.function())
      )
      .default([])
      .description(`Specify rehype plugins`),
    plugins: Joi.array().items(Joi.string(), Joi.object({}).unknown(true)),
    mediaTypes: Joi.array()
      .items(Joi.string())
      .default(["text/markdown", "text/x-markdown"])
      .description(`Determine which media types are processed by MDX`),
    shouldBlockNodeFromTransformation: Joi.function()
      .maxArity(1)
      .default(() => () => false)
      .description(
        `Disable MDX transformation for nodes where this function returns true`
      ),
  })
}
