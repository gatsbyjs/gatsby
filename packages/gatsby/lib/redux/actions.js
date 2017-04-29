import Joi from "joi"
import chalk from "chalk"
const _ = require(`lodash`)
const { bindActionCreators } = require(`redux`)

const { getNode, hasNodeChanged } = require(`./index`)

const { store } = require(`./index`)
import * as joiSchemas from "../joi-schemas/joi"
import { layoutComponentChunkName } from "../utils/js-chunk-names"

const actions = {}

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
    payload: page,
  }
}

actions.updateNode = (node, plugin = ``) => {
  if (!_.isObject(node)) {
    return console.log(
      chalk.bold.red(
        `The node passed to the "updateNode" action creator must be an object`
      )
    )
  }
  const result = Joi.validate(node, joiSchemas.nodeSchema)
  if (result.error) {
    console.log(chalk.bold.red(`The updated node didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(node)
    return { type: `VALIDATION_ERROR`, error: true }
  }

  return {
    type: `UPDATE_NODE`,
    plugin,
    payload: node,
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

actions.createNode = (node, plugin = ``) => {
  if (!_.isObject(node)) {
    return console.log(
      chalk.bold.red(
        `The node passed to the "createNode" action creator must be an object`
      )
    )
  }
  const result = Joi.validate(node, joiSchemas.nodeSchema)
  if (result.error) {
    console.log(chalk.bold.red(`The new node didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(node)
    return { type: `VALIDATION_ERROR`, error: true }
  }

  // Check if the node has already been processed.
  if (getNode(node.id) && !hasNodeChanged(node.id, node.contentDigest)) {
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
