const Redux = require("redux")
const { isFSA } = require("flux-standard-action")
const Joi = require("joi")
const chalk = require("chalk")
const _ = require("lodash")

import { gatsbyConfigSchema } from "../joi-schemas/joi"

const reducer = (state, action) => {
  if (!isFSA(action)) {
    throw new Error("Not standard action", action)
  }

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
        return
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
    case "UPSERT_PAGE":
      const index = _.findIndex(state.pages, p => {
        return p.path === action.payload.path
      })
      // If the path already exists, overwrite it.
      // Otherwise, add it to the end.
      if (index !== -1) {
        return {
          ...state,
          pages: state.pages
            .slice(0, index)
            .concat(action.payload)
            .concat(state.pages.slice(index + 1)),
        }
      } else {
        return {
          ...state,
          pages: state.pages.concat(action.payload),
        }
      }
    default:
      return state
  }

  return state
}

const initialState = {
  program: { directory: `/` },
  pages: [],
  config: {},
  plugins: [],
  flattenedPlugins: [],
  program: {},
  nodes: {},
}

const store = Redux.createStore(reducer, initialState)

exports.store = store
exports.reducer = reducer
