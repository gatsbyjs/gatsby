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

actions.deletePageByPath = (path, plugin = ``) => {
  return {
    type: `DELETE_PAGE_BY_PATH`,
    payload: path,
  }
}

const pascalCase = _.flow(_.camelCase, _.upperFirst)
actions.upsertPage = (page, plugin = ``) => {
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

  return {
    type: `UPSERT_PAGE`,
    plugin,
    payload: page,
  }
}

actions.deleteNode = (nodeId, plugin = ``) => {
  return {
    type: `DELETE_NODE`,
    plugin,
    payload: nodeId,
  }
}

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
    node.internal.pluginOwner = plugin.name
  }

  const result = Joi.validate(node, joiSchemas.nodeSchema)
  if (result.error) {
    console.log(chalk.bold.red(`The new node didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(node)
    return { type: `VALIDATION_ERROR`, error: true }
  }

  // Ensure node isn't directly setting pluginFields.
  if (node.pluginFields) {
    throw new Error(
      stripIndent`
      Plugins creating nodes can not set data on the reserved field "pluginFields"
      as this is reserved for plugins which wish to extend your nodes.

      If your plugin didn't add "pluginFields" you're probably seeing this
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
  if (oldNode && oldNode.internal.pluginOwner !== plugin.name) {
    throw new Error(
      stripIndent`
      Nodes can only be updated by their owner. Node ${node.id} is
      owned by ${oldNode.internal.pluginOwner} and another plugin ${plugin.name}
      tried to update it.

      Node:

      ${JSON.stringify(node, null, 4)}

      Plugin that tried to update the node:

      ${JSON.stringify(plugin, null, 4)}
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

actions.addFieldToNode = ({ node, fieldName, fieldValue }, plugin) => {
  // Ensure required fields are set.
  if (!node.internal.fieldPluginOwners) {
    node.internal.fieldPluginOwners = {}
  }
  if (!node.pluginFields) {
    node.pluginFields = {}
  }

  // Check that this field isn't owned by another plugin.
  const fieldOwner = node.internal.fieldPluginOwners[fieldName]
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
  node.pluginFields[fieldName] = fieldValue
  node.internal.fieldPluginOwners[fieldName] = plugin.name

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
