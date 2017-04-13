import Joi from "joi"
import chalk from "chalk"
const _ = require("lodash")
const { bindActionCreators } = require("redux")

const { store } = require("./index")
import * as joiSchemas from "../joi-schemas/joi"
import { layoutComponentChunkName } from "../utils/js-chunk-names"

const actions = {}

actions.upsertPage = page => {
  page.componentChunkName = layoutComponentChunkName(page.component)
  const result = Joi.validate(page, joiSchemas.pageSchema)
  if (result.error) {
    console.log(chalk.blue.bgYellow(`The upserted page didn't pass validation`))
    console.log(chalk.bold.red(result.error))
    console.log(page)
    return
  }

  return {
    type: "UPSERT_PAGE",
    payload: page,
  }
}

actions.updateNode = node => {
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
    type: "UPDATE_NODE",
    payload: node,
  }
}

actions.createNode = node => {
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

  return {
    type: "CREATE_NODE",
    payload: node,
  }
}

actions.updateSourcePluginStatus = status => {
  return {
    type: `UPDATE_SOURCE_PLUGIN_STATUS`,
    payload: status,
  }
}

actions.addPageDependency = ({ path, nodeId, connection }) => {
  return {
    type: `ADD_PAGE_DEPENDENCY`,
    payload: {
      path,
      nodeId,
      connection,
    },
  }
}

exports.actions = actions
exports.boundActionCreators = bindActionCreators(actions, store.dispatch)
