/**
 * Let's plugins implementing support for other compile-to-js add to the list
 * of "resolvable" file extensions. Gatsby supports `.js` and `.jsx` by default.
 * @returns {Array} array of extensions
 */
exports.resolvableExtensions = true

/**
 * Tell plugins to add pages. This extension point is called only after the initial
 * sourcing and transformation of nodes plus creation of the GraphQL schema are
 * complete so you can query your data in order to create pages.
 *
 * See also [the documentation for the action `createPage`](/docs/actions/#createPage).
 * @example
 * exports.createPages = ({ graphql, actions }) => {
 *   const { createPage } = actions
 *   return new Promise((resolve, reject) => {
 *     const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
 *     // Query for markdown nodes to use in creating pages.
 *     resolve(
 *       graphql(
 *         `
 *       {
 *         allMarkdownRemark(limit: 1000) {
 *           edges {
 *             node {
 *               fields {
 *                 slug
 *               }
 *             }
 *           }
 *         }
 *       }
 *     `
 *       ).then(result => {
 *         if (result.errors) {
 *           reject(result.errors)
 *         }
 *
 *         // Create blog post pages.
 *         result.data.allMarkdownRemark.edges.forEach(edge => {
 *             createPage({
 *               path: `${edge.node.fields.slug}`, // required
 *               component: slash(blogPostTemplate),
 *               context: {
 *                 slug: edge.node.fields.slug,
 *               },
 *             })
 *         })
 *
 *         return
 *       })
 *     )
 *   })
 * }
 * @returns {Array} array of extensions
 */

exports.createPages = true

/**
 * Like `createPages` but for plugins who want to manage creating and removing
 * pages themselves in response to changes in data *not* managed by Gatsby.
 * Plugins implementing `createPages` will get called regularly to recompute
 * page information as Gatsby's data changes but those implementing
 * `createPagesStatefully` will not.
 *
 * An example of a plugin that uses this extension point is the internal plugin
 * [component-page-creator](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/component-page-creator)
 * which monitors the `src/pages` directory for the adding and removal of JS
 * pages. As its source of truth, files in the pages directory, is not known by
 * Gatsby, it needs to keep its own state about its world to know when to
 * add and remove pages.
 */
exports.createPagesStatefully = true

/**
 * Tell plugins to add layouts. This extension point is called only after the initial
 * sourcing and transformation of nodes plus creation of the GraphQL schema are
 * complete so you can query your data in order to create layouts.
 *
 * See also the documentation for [`createLayout`](/docs/actions/#createLayout).
 * @example
 * exports.createLayouts = ({ graphql, actions }) => {
 *  actions.createLayout({
 *    component: path.resolve(`src/templates/custom-layout.js`),
 *    id: 'custom', // optional - if not provided the filename will be used as id
 *   })
 *  }
 */
exports.createLayouts = true

/**
 * Extension point to tell plugins to source nodes.
 *
 * See also the documentation for [`createNode`](/docs/actions/#createNode).
 * @example
 * exports.sourceNodes = ({ actions }) => {
 *   const { createNode } = actions
 *   // Create nodes here.
 * }
 */
exports.sourceNodes = true

/**
 * Called when a new node is created. Plugins wishing to extend or
 * transform nodes created by other plugins should implement this API.
 *
 * See also the documentation for [`createNode`](/docs/actions/#createNode)
 * and [`createNodeField`](/docs/actions/#createNodeField)
 * @example
 * exports.onCreateNode = ({ node, actions }) => {
 *   const { createNode, createNodeField } = actions
 *   // Transform the new node here and create a new node or
 *   // create a new node field.
 * }
 */
exports.onCreateNode = true

/**
 * Called when a new page is created. This extension API is useful
 * for programmatically manipulating pages created by other plugins e.g.
 * if you want paths without trailing slashes.
 *
 * See the guide [Creating and Modifying Pages](/docs/creating-and-modifying-pages/)
 * for more on this API.
 */
exports.onCreatePage = true

/**
 * Called when a new layout is created. This extension API is useful
 * for programmatically manipulating layouts created by other plugins
 */
exports.onCreateLayout = true

/**
 * Called during the creation of the GraphQL schema. Allows plugins
 * to add new fields to the types created from data nodes. Many transformer
 * plugins use this to add fields that take arguments.
 *
 * * [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/)
 * adds an "excerpt" field where the user when writing their query can specify
 * how many characters to prune the markdown source to.
 * * [`gatsby-transformer-sharp`](/packages/gatsby-transformer-sharp/) exposes
 * many image transformation options as GraphQL fields.
 */
exports.setFieldsOnGraphQLNodeType = true

/**
 * Ask compile-to-js plugins to process source to JavaScript so the query
 * runner can extract out GraphQL queries for running.
 */
exports.preprocessSource = true

/**
 * Tell plugins with expensive "side effects" from queries to start running
 * those now. This is a soon-to-be-replaced API only currently in use by
 * `gatsby-plugin-sharp`.
 */
exports.generateSideEffects = true

/**
 * Let plugins extend/mutate the site's Babel configuration.
 * This API will change before 2.0 as it needs still to be converted to use
 * Redux actions.
 */
exports.onCreateBabelConfig = true

/**
 * Let plugins extend/mutate the site's webpack configuration.
 *
 * See also the documentation for [`setWebpackConfig`](/docs/actions/#setWebpackConfig).
 *
 * @param {object} $0
 * @param {'develop' | 'develop-html' | 'build-javascript' | 'build-html'} $0.stage The current build stage
 * @param {function(): object} $0.getConfig Returns the current webpack config
 * @param {object} $0.rules A set of preconfigured webpack config rules
 * @param {object} $0.loaders A set of preconfigured webpack config loaders
 * @param {object} $0.plugins A set of preconfigured webpack config plugins
 * @param {object} $0.actions
 * @example
 * exports.onCreateWebpackConfig = ({
 *  stage, getConfig, rules, loaders, actions
 * }) => {
 *   actions.setWebpackConfig({
 *     module: {
 *       rules: [
 *         {
 *           test: 'my-css',
 *           use: [loaders.style(), loaders.css()]
 *         },
 *       ],
 *     },
 *   });
 * }
 */
exports.onCreateWebpackConfig = true

/**
 * Called at the start of the bootstrap process before any other extension APIs are called.
 */
exports.onPreBootstrap = true

/**
 * Called at the end of the bootstrap process after all other extension APIs have been called.
 */
exports.onPostBootstrap = true

/**
 * The first extension point called during the build process. Called after the bootstrap has completed but before the build steps start.
 */
exports.onPreBuild = true

/**
 * The last extension point called after all other parts of the build process
 * are complete.
 */
exports.onPostBuild = true

/**
 * Run before GraphQL queries/fragments are extracted from JavaScript files. Useful for plugins
 * to add more JavaScript files with queries/fragments e.g. from node_modules.
 *
 * See gatsby-transformer-remark and gatsby-source-contentful for examples.
 */
exports.onPreExtractQueries = true
