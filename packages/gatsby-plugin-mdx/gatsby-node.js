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

if (process.env.GATSBY_EXPERIMENTAL_PLUGIN_OPTION_VALIDATION) {
  exports.pluginOptionsSchema = function ({ Joi }) {
    return Joi.object({
      extensions: Joi.array()
        .items(Joi.string())
        .default([".mdx"])
        .description(
          `Configure the file extensions that gatsby-plugin-mdx will process`
        ),
      defaultLayout: Joi.object({})
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
      remarkPlugins: Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.object({}).unknown(true),
            Joi.array().items(Joi.object({}).unknown(true))
          )
        )
        .default([])
        .description(`Specify remark plugins`),
      rehypePlugins: Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.object({}).unknown(true),
            Joi.array().items(Joi.object({}).unknown(true))
          )
        )
        .default([])
        .description(`Specify rehype plugins`),
      mediaTypes: Joi.array()
        .items(Joi.string())
        .default(["text/markdown", "text/x-markdown"])
        .description(`Determine which media types are processed by MDX`),
      shouldBlockNodeFromTransformation: Joi.function()
        .maxArity(1)
        .default(() => false)
        .description(
          `Disable MDX transformation for nodes where this function returns true`
        ),
    })
  }
}
