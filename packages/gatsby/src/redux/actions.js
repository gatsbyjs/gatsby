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
 * Create a page. See https://gatsbyjs.org/docs/creating-and-modifying-pages/
 * for detailed documenation about creating pages.
 * @param {object} page a page object
 * @param {string} page.path Any valid URL. Must start with a forward slash
 * @param {string} page.component The absolute path to the component for this page
 * @param {object} page.context Context data for this page. Passed as props
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
actions.createPage = (page, plugin = ``) => {
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
    type: `UPSERT_PAGE`,
    plugin,
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
 * Batch delete multiple nodes
 * @param {array} nodes an array of node ids
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

actions.touchNode = (nodeId, plugin = ``) => {
  return {
    type: `TOUCH_NODE`,
    plugin,
    payload: nodeId,
  }
}

const typeOwners = {}
actions.createNode = (node, plugin) => {
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

        The node type "${node.internal.type}" is owned by "${typeOwners[node.internal.type]}".

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
      payload: node.id,
    }
  } else {
    return {
      type: `CREATE_NODE`,
      plugin,
      payload: node,
    }
  }
}

/**
 * Create field on a node a plugin don't own. Once a plugin has claimed a field name
 * the field name can't be used by other plugins.
 * @param {Object} $0
 * @param {Object} $0.node the target node object
 * @param {String} $0.fieldName the name for the field
 * @param {String} $0.fieldValue the value for the field
 * @example
 * createNodeField({
 *   node,
 *   fieldName: `happiness`,
 *   fieldValue: `is sweet graphql queries`
 * })
 */
actions.createNodeField = ({ node, fieldName, fieldValue }, plugin) => {
  // Ensure required fields are set.
  if (!node.internal.fieldOwners) {
    node.internal.fieldOwners = {}
  }
  if (!node.fields) {
    node.fields = {}
  }

  // Check that this field isn't owned by another plugin.
  const fieldOwner = node.internal.fieldOwners[fieldName]
  if (fieldOwner && fieldOwner !== plugin.name) {
    throw new Error(
      stripIndent`
      A plugin tried to update a node field that it doesn't own:

      Node id: ${node.id}
      Plugin: ${plugin.name}
      fieldName: ${fieldName}
      fieldValue: ${fieldValue}
      `
    )
  }

  // Update node
  node.fields[fieldName] = fieldValue
  node.internal.fieldOwners[fieldName] = plugin.name

  return {
    type: `ADD_FIELD_TO_NODE`,
    plugin,
    payload: node,
  }
}

actions.addNodeToParent = ({ parent, child }, plugin) => {
  // Update parent
  parent.children.push(child.id)
  parent.children = _.uniq(parent.children)

  return {
    type: `ADD_CHILD_NODE_TO_PARENT_NODE`,
    plugin,
    payload: parent,
  }
}

actions.updateSourcePluginStatus = (status, plugin = ``) => {
  return {
    type: `UPDATE_SOURCE_PLUGIN_STATUS`,
    plugin,
    payload: status,
  }
}

actions.addPageDependency = ({ path, nodeId, connection }, plugin = ``) => {
  return {
    type: `ADD_PAGE_DEPENDENCY`,
    plugin,
    payload: {
      path,
      nodeId,
      connection,
    },
  }
}

actions.removePagesDataDependencies = paths => {
  return {
    type: `REMOVE_PAGES_DATA_DEPENDENCIES`,
    payload: {
      paths,
    },
  }
}

actions.addPageComponent = componentPath => {
  return {
    type: `ADD_PAGE_COMPONENT`,
    payload: {
      componentPath,
    },
  }
}

actions.setPageComponentQuery = ({ query, componentPath }) => {
  return {
    type: `SET_PAGE_COMPONENT_QUERY`,
    payload: {
      query,
      componentPath,
    },
  }
}

exports.actions = actions
exports.boundActionCreators = bindActionCreators(actions, store.dispatch)
