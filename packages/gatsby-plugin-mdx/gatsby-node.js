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
exports.createSchemaCustomization = require(`./gatsby/create-schema-customization`)

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

// Dedupe warning
let warnedAboutJSFrontmatterEngine = false

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
    gatsbyRemarkPlugins: Joi.subPlugins().description(
      `Use Gatsby-specific remark plugins`
    ),
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
    root: Joi.string()
      .default(process.cwd())
      .description(
        `[deprecated] This is a legacy option that used to define root directory of the project. It was needed to generate a cache directory location. It currently has no effect.`
      ),
    commonmark: Joi.boolean()
      .default(false)
      .description("MDX will be parsed using CommonMark."),
    JSFrontmatterEngine: Joi.boolean()
      .default(false)
      .description(`Enable JavaScript frontmatter parsing`),
  }).custom(value => {
    const { JSFrontmatterEngine, engines = {} } = value || {}

    if (JSFrontmatterEngine) {
      // show this warning only once in main process
      if (!process.env.GATSBY_WORKER_ID) {
        console.warn(
          `JS frontmatter engine is enabled in gatsby-plugin-mdx (via JSFrontmatterEngine: true in plugin options). This can cause a security risk, see https://github.com/gatsbyjs/gatsby/security/advisories/GHSA-mj46-r4gr-5x83. If you are not relying on this feature we strongly suggest disabling it via the "JSFrontmatterEngine: false" plugin option. If you rely on this feature make sure to properly secure or sanitize your content source.`
        )
      }
      return value
    }

    const js = () => {
      if (!warnedAboutJSFrontmatterEngine) {
        console.warn(
          `You have frontmatter declared with "---js" or "---javascript" that is not parsed by default to mitigate a security risk (see https://github.com/gatsbyjs/gatsby/security/advisories/GHSA-mj46-r4gr-5x83). If you require this feature it can be enabled by setting "JSFrontmatterEngine: true" in the plugin options of gatsby-plugin-mdx.`
        )
        warnedAboutJSFrontmatterEngine = true
      }
      // we still have to return a frontmatter, se we just stub it with empty object
      return {}
    }

    return {
      ...value,
      engines: {
        ...engines,
        js,
        javascript: js,
      },
    }
  })
}
