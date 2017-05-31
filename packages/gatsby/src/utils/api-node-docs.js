/**
 * Let's plugins implementing support for other compile-to-js add to the list
 * of "resolvable" file extensions. Gatsby supports `.js` and `.jsx` by default.
 * @returns {Array} array of extensions
 */
exports.resolvableExtensions = true

/**
 * Let plugins add pages. This extension point is called only after the initial
 * sourcing and transformation of nodes plus creation of the GraphQL schema are
 * complete so you can query your data in order to create pages.
 *
 * See also the documentation for [`createPage`](/docs/bound-action-creators/#createPage).
 * @example
 * exports.createPages = ({ graphql, boundActionCreators }) => {
 *   const { createPage } = boundActionCreators
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
 * [component-page-creator](https://github.com/gatsbyjs/gatsby/tree/document-refactor-apis/packages/gatsby/src/bootstrap/internal-plugins/component-page-creator)
 * which monitors the `src/pages` directory for the adding and removal of JS
 * pages. As its source of truth, files in the pages directory, is not known by
 * Gatsby, it needs to keep its own state about its world to know when to
 * add and remove pages.
 */
exports.createPagesStatefully = true

/**
 * Extension point to tell plugins to source nodes.
 *
 * See also the documentation for [`createNode`](/docs/bound-action-creators/#createNode).
 * @example
 * exports.sourceNodes = ({ boundActionCreators }) => {
 *   const { createNode } = boundActionCreators
 *   // Create nodes here.
 * }
 */
exports.sourceNodes = true

/**
 * Called when a new node is created. Plugins wishing to extend or
 * transform nodes created by other plugins should implement this API.
 *
 * See also the documentation for [`createNode`](/docs/bound-action-creators/#createNode)
 * and [`createNodeField`](/docs/bound-action-creators/#createNodeField)
 * @example
 * exports.onCreateNode = ({ node, boundActionCreators }) => {
 *   const { createNode, createNodeField } = boundActionCreators
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
 * Called during the creation of the GraphQL schema. Allows plugins
 * to add new fields to the types created from data nodes. Many transformer
 * plugins use this to add fields that take arguments.
 *
 * * [`gatsby-transformer-remark`](/docs/packages/gatsby-transformer-remark/)
 * adds an "excerpt" field where the user when writing their query can specify
 * how many characters to prune the markdown source to.
 * * [`gatsby-transformer-sharp`](/docs/packages/gatsby-transformer-sharp/) exposes
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
 * This API will change before 1.0 as it needs still to be converted to use
 * Redux actions.
 */
exports.modifyBabelrc = true

/**
 * Let plugins extend/mutate the site's webpack configuration.
 * This API will change before 1.0 as it needs still to be converted to use
 * Redux actions.
 */
exports.modifyWebpackConfig = true
