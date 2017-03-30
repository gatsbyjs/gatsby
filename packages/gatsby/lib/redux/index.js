const Redux = require("redux")
const { isFSA } = require("flux-standard-action")
import Joi from "joi"
import chalk from "chalk"

import { gatsbyConfigSchema } from "../joi-schemas/joi"

const reducer = (state, action) => {
  if (!isFSA(action)) {
    throw new Error("Not standard action", action)
  }

  console.log("action", action)

  switch (action.type) {
    case "SET_PROGRAM":
      return {
        ...state,
        program: action.payload,
      }

    case "SET_SITE_CONFIG":
      // Validate the config.
      const result = Joi.validate(action.payload, gatsbyConfigSchema)
      // TODO use Redux for capturing errors from different
      // parts of Gatsby so a) can capture richer errors and b) be
      // more flexible how to display them.
      if (result.error) {
        console.log(
          chalk.blue.bgYellow(`The site's gatsby.config.js failed validation`)
        )
        console.log(chalk.bold.red(result.error))
        console.log(action.payload)
        throw new Error(`The site's gatsby.config.js failed validation`)
      }
      return {
        ...state,
        config: action.payload,
      }
    case "SET_SITE_PLUGINS":
      return {
        ...state,
        plugins: action.payload,
      }
    case "SET_SITE_FLATTENED_PLUGINS":
      return {
        ...state,
        flattenedPlugins: action.payload,
      }
    default:
      return state
  }

  return state
}

const initialState = {
  program: {},
  pages: [],
  config: {},
  plugins: [],
  flattenedPlugins: [],
  program: {},
  nodes: {},
}

const store = Redux.createStore(reducer, initialState)

exports.store = store
