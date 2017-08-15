// @flow
import Joi from "joi"
import chalk from "chalk"
const _ = require(`lodash`)
const { bindActionCreators } = require(`redux`)
const { stripIndent } = require(`common-tags`)

const { getNode, hasNodeChanged } = require(`./index`)

const { store } = require(`./index`)
import * as joiSchemas from "../joi-schemas/joi"
import { layoutComponentChunkName } from "../utils/js-chunk-names"

const actions = {}

/**
 * Delete a page
 * @param {string} page a page object with at least the path set
 * @example
 * deletePage(page)
 */
actions.deletePage = (page, plugin = ``) => {
  return {
    type: `DELETE_PAGE`,
    payload: page,
  }
}

const pascalCase = _.flow(_.camelCase, _.upperFirst)
/**
 * Create a page. See [the guide on creating and modifying pages](/docs/creating-and-modifying-pages/)
 * for detailed documenation about creating pages.
 * @param {Object} page a page object
 * @param {string} page.path Any valid URL. Must start with a forward slash
 * @param {string} page.component The absolute path to the component for this page
 * @param {Object} page.context Context data for this page. Passed as props
 * to the component `this.props.pathContext` as well as to the graphql query
 * as graphql arguments.
 * @example
 * createPage({
 *   path: `/my-sweet-new-page/`,
 *   component: path.resolve('./src/templates/my-sweet-new-page.js`),
 *   // context gets passed in as props to the page as well
 *   // as into the page/template's GraphQL query.
 *   context: {
 *     id: `123456`,
 *   },
 * })
 */
actions.createPage = (page, plugin = ``, traceId) => {
  page.componentChunkName = layoutComponentChunkName(page.component)

  let jsonName = `${_.kebabCase(page.path)}.json`
  let internalComponentName = `Component${pascalCase(page.path)}`
  if (jsonName === `.json`) {
    jsonName = `index.json`
    internalComponentName = `ComponentIndex`
  }

  page.jsonName = jsonName
  page.internalComponentName = internalComponentName

  // Ensure the page has a context object
  if (!page.context) {
    page.context = {}
  }

  const result = Joi.validate(page, joiSchemas.pageSchema)
  if (result.error) {
    console.log(chalk.blue.bgYellow(`The upserted page didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(page)
    return
  }

  // If the path doesn't have an initial forward slash, add it.
  if (page.path[0] !== `/`) {
    page.path = `/` + page.path
  }

  return {
    type: `CREATE_PAGE`,
    plugin,
    traceId,
    payload: page,
  }
}

/**
 * Delete a node
 * @param {string} nodeId a node id
 * @example
 * deleteNode(node.id)
 */
actions.deleteNode = (nodeId, plugin = ``) => {
  return {
    type: `DELETE_NODE`,
    plugin,
    payload: nodeId,
  }
}

/**
 * Batch delete nodes
 * @param {Array} nodes an array of node ids
 * @example
 * deleteNodes([`node1`, `node2`])
 */
actions.deleteNodes = (nodes, plugin = ``) => {
  return {
    type: `DELETE_NODES`,
    plugin,
    payload: nodes,
  }
}

const typeOwners = {}
/**
 * Create a new node
 * @param {Object} node a node object
 * @param {string} node.id The node's ID. Must be globally unique.
 * @param {string} node.parent The ID of the parent's node. If the node is
 * derived from another node, set that node as the parent. Otherwise it can
 * just be an empty string.
 * @param {Array} node.children An array of children node IDs. If you're
 * creating the children nodes while creating the parent node, add the
 * children node IDs here directly. If you're adding a child node to a
 * parent node created by a plugin, you can't mutate this value directly
 * to add your node id, instead use the action creator `createParentChildLink`.
 * @param {Object} node.internal node fields that aren't generally
 * interesting to consumers of node data but are very useful for plugin writers
 * and Gatsby core.
 * @param {string} node.internal.mediaType Either an official media type (we use
 * mime-db as our source (https://www.npmjs.com/package/mime-db) or a made-up
 * one if your data doesn't fit in any existing bucket. Transformer plugins
 * frequently use node media types for deciding if they should transform a
 * node into a new one. E.g. markdown transformers look for media types of
 * text/x-markdown.
 * @param {string} node.internal.type An arbitrary globally unique type
 * choosen by the plugin creating the node. Should be descriptive of the
 * node as the type is used in forming GraphQL types so users will query
 * for nodes based on the type choosen here. Nodes of a given type can
 * only be created by one plugin.
 * @param {string} node.internal.content raw content of the node. Can be
 * excluded if it'd be memory intensive to load in which case you must
 * define a `loadNodeContent` function for this node.
 * @param {string} node.internal.contentDigest the digest for the content
 * of this node. Helps Gatsby avoid doing extra work on data that hasn't
 * changed.
 * @example
 * createNode({
 *   // Data for the node.
 *   ...fieldData,
 *   id: `a-node-id`,
 *   parent: `the-id-of-the-parent-node`,
 *   children: [],
 *   internal: {
 *     mediaType: `text/x-markdown`,
 *     type: `CoolServiceMarkdownField`,
 *     content: JSON.stringify(fieldData),
 *     contentDigest: crypto
 *       .createHash(`md5`)
 *       .update(JSON.stringify(fieldData))
 *       .digest(`hex`),
 *   }
 * })
 */
actions.createNode = (node, plugin, traceId) => {
  if (!_.isObject(node)) {
    return console.log(
      chalk.bold.red(
        `The node passed to the "createNode" action creator must be an object`
      )
    )
  }

  // Ensure the new node has an internals object.
  if (!node.internal) {
    node.internal = {}
  }

  // Tell user not to set the owner name themself.
  if (node.internal.owner) {
    console.log(JSON.stringify(node, null, 4))
    console.log(
      chalk.bold.red(
        `The node internal.owner field is set automatically by Gatsby and not by plugin`
      )
    )
    process.exit(1)
  }

  // Add the plugin name to the internal object.
  if (plugin) {
    node.internal.owner = plugin.name
  }

  const result = Joi.validate(node, joiSchemas.nodeSchema)
  if (result.error) {
    console.log(chalk.bold.red(`The new node didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(node)
    return { type: `VALIDATION_ERROR`, error: true }
  }

  // Ensure node isn't directly setting fields.
  if (node.fields) {
    throw new Error(
      stripIndent`
      Plugins creating nodes can not set data on the reserved field "fields"
      as this is reserved for plugins which wish to extend your nodes.

      If your plugin didn't add "fields" you're probably seeing this
      error because you're reusing an old node object.

      Node:

      ${JSON.stringify(node, null, 4)}

      Plugin that created the node:

      ${JSON.stringify(plugin, null, 4)}
    `
    )
  }

  // Ensure the plugin isn't creating a node type owned by another
  // plugin. Type "ownership" is first come first served.
  if (!typeOwners[node.internal.type] && plugin) {
    typeOwners[node.internal.type] = plugin.name
  } else {
    if (typeOwners[node.internal.type] !== plugin.name) {
      throw new Error(
        stripIndent`
        The plugin "${plugin.name}" created a node of a type owned by another plugin.

        The node type "${node.internal.type}" is owned by "${typeOwners[
          node.internal.type
        ]}".

        If you copy and pasted code from elsewhere, you'll need to pick a new type name
        for your new node(s).

        The node object passed to "createNode":

        ${JSON.stringify(node, null, 4)}

        The plugin creating the node:

        ${JSON.stringify(plugin, null, 4)}
      `
      )
    }
  }

  const oldNode = getNode(node.id)

  // If the node has been created in the past, check that
  // the current plugin is the same as the previous.
  if (oldNode && oldNode.internal.owner !== plugin.name) {
    throw new Error(
      stripIndent`
      Nodes can only be updated by their owner. Node "${node.id}" is
      owned by "${oldNode.internal.owner}" and another plugin "${plugin.name}"
      tried to update it.

      `
    )
  }

  // Check if the node has already been processed.
  if (oldNode && !hasNodeChanged(node.id, node.internal.contentDigest)) {
    return {
      type: `TOUCH_NODE`,
      plugin,
      traceId,
      payload: node.id,
    }
  } else {
    return {
      type: `CREATE_NODE`,
      plugin,
      traceId,
      payload: node,
    }
  }
}

/**
 * "Touch" a node. Tells Gatsby a node still exists and shouldn't
 * be garbage collected. Primarily useful for source plugins fetching
 * nodes from a remote system that can return only nodes that have
 * updated. The source plugin then touches all the nodes that haven't
 * updated but still exist so Gatsby knows to keep them.
 * @param {string} nodeId The id of a node.
 * @example
 * touchNode(`a-node-id`)
 */
actions.touchNode = (nodeId, plugin = ``) => {
  return {
    type: `TOUCH_NODE`,
    plugin,
    payload: nodeId,
  }
}

/**
 * Extend another node. The new node field is placed under the `fields`
 * key on the extended node object.
 *
 * Once a plugin has claimed a field name the field name can't be used by
 * other plugins.  Also since node's are immutable, you can't mutate the node
 * directly. So to extend another node, use this.
 * @param {Object} $0
 * @param {Object} $0.node the target node object
 * @param {string} $0.name the name for the field
 * @param {string} $0.value the value for the field
 * @example
 * createNodeField({
 *   node,
 *   name: `happiness`,
 *   value: `is sweet graphql queries`
 * })
 *
 * // The field value is now accessible at node.fields.happiness
 */
actions.createNodeField = (
  { node, name, value, fieldName, fieldValue },
  plugin,
  traceId
) => {
  if (fieldName) {
    console.warn(
      `Calling "createNodeField" with "fieldName" is deprecated. Use "name" instead`
    )
    if (!name) {
      name = fieldName
    }
  }
  if (fieldValue) {
    console.warn(
      `Calling "createNodeField" with "fieldValue" is deprecated. Use "value" instead`
    )
    if (!value) {
      value = fieldValue
    }
  }
  // Ensure required fields are set.
  if (!node.internal.fieldOwners) {
    node.internal.fieldOwners = {}
  }
  if (!node.fields) {
    node.fields = {}
  }

  // Check that this field isn't owned by another plugin.
  const fieldOwner = node.internal.fieldOwners[name]
  if (fieldOwner && fieldOwner !== plugin.name) {
    throw new Error(
      stripIndent`
      A plugin tried to update a node field that it doesn't own:

      Node id: ${node.id}
      Plugin: ${plugin.name}
      name: ${name}
      value: ${value}
      `
    )
  }

  // Update node
  node.fields[name] = value
  node.internal.fieldOwners[name] = plugin.name

  return {
    type: `ADD_FIELD_TO_NODE`,
    plugin,
    traceId,
    payload: node,
  }
}

/**
 * Creates a link between a parent and child node
 * @param {Object} $0
 * @param {Object} $0.parent the parent node object
 * @param {Object} $0.child the child node object
 * @example
 * createParentChildLink({ parent: parentNode, child: childNode })
 */
actions.createParentChildLink = ({ parent, child }, plugin) => {
  // Update parent
  parent.children.push(child.id)
  parent.children = _.uniq(parent.children)

  return {
    type: `ADD_CHILD_NODE_TO_PARENT_NODE`,
    plugin,
    payload: parent,
  }
}

/**
 * Create a dependency between a page and data. Probably for
 * internal use only.
 * @param {Object} $0
 * @param {string} $0.path the path to the page
 * @param {string} $0.nodeId A node ID
 * @param {string} $0.connection A connection type
 * @private
 */
actions.createPageDependency = ({ path, nodeId, connection }, plugin = ``) => {
  return {
    type: `CREATE_PAGE_DEPENDENCY`,
    plugin,
    payload: {
      path,
      nodeId,
      connection,
    },
  }
}

/**
 * Delete dependencies between an array of pages and data. Probably for
 * internal use only. Used when deleting pages.
 * @param {Array} paths the paths to delete.
 * @private
 */
actions.deletePagesDependencies = paths => {
  return {
    type: `DELETE_PAGES_DEPENDENCIES`,
    payload: {
      paths,
    },
  }
}

/**
 * Used by the query watcher when it identifies a new component
 * which is probably a page. TODO perhaps the query watcher
 * just listens for new pages?
 * @private
 */
actions.createPageComponent = componentPath => {
  return {
    type: `CREATE_PAGE_COMPONENT`,
    payload: {
      componentPath,
    },
  }
}

/**
 * When the query watcher extracts a graphq query, it calls
 * this to store the query with its component.
 * @private
 */
actions.replacePageComponentQuery = ({ query, componentPath }) => {
  return {
    type: `REPLACE_PAGE_COMPONENT_QUERY`,
    payload: {
      query,
      componentPath,
    },
  }
}

/**
 * Merge additional configuration into the current webpack config. A few
 * configurations options will be ignored if set, in order to try prevent accidental breakage.
 * Specifically, any change to `entry`, `output`, `target`, or `resolveLoaders` will be ignored.
 *
 * For full control over the webpack config, use `replaceWebpackConfig()`.
 *
 * @param {Object} config partial webpack config, to be merged into the current one
 */
actions.setWebpackConfig = (config: Object) => {
  return {
    type: `SET_WEBPACK_CONFIG`,
    payload: config,
  }
}

/**
 * Completely replace the webpack config for the current stage. This can be
 * dangerous and break Gatsby if certain configuration options are changed.
 *
 * Generally only useful for cases where you need to handle config merging logic
 * yourself, in which case consider using `webpack-merge`.
 *
 * @param {Object} config complete webpack config
 */
actions.replaceWebpackConfig = (config: Object) => {
  return {
    type: `REPLACE_WEBPACK_CONFIG`,
    payload: config,
  }
}

/**
 * Create a "job". This is a long-running process that are generally
 * started as side-effects to GraphQL queries.
 * [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp/) uses this for
 * example.
 *
 * Gatsby doesn't finish its bootstrap until all jobs are ended.
 * @param {Object} job A job object with at least an id set
 * @param {id} job.id The id of the job
 * @example
 * createJob({ id: `write file id: 123`, fileName: `something.jpeg` })
 */
actions.createJob = (job, plugin = {}) => {
  return {
    type: `CREATE_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * Set (update) a "job". Sometimes on really long running jobs you want
 * to update the job as it continues.
 *
 * @param {Object} job A job object with at least an id set
 * @param {id} job.id The id of the job
 * @example
 * setJob({ id: `write file id: 123`, progress: 50 })
 */
actions.setJob = (job, plugin = {}) => {
  return {
    type: `SET_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * End a "job".
 *
 * Gatsby doesn't finish its bootstrap until all jobs are ended.
 * @param {Object} job  A job object with at least an id set
 * @param {id} job.id The id of the job
 * @example
 * endJob({ id: `write file id: 123` })
 */
actions.endJob = (job, plugin = {}) => {
  return {
    type: `END_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * Set plugin status. A plugin can use this to save status keys e.g. the last
 * it fetched something. These values are persisted between runs of Gatsby.
 *
 * @param {Object} status  An object with arbitrary values set
 * @example
 * setPluginStatus({ lastFetched: Date.now() })
 */
actions.setPluginStatus = (status, plugin) => {
  return {
    type: `SET_PLUGIN_STATUS`,
    plugin,
    payload: status,
  }
}

exports.actions = actions
exports.boundActionCreators = bindActionCreators(actions, store.dispatch)
