const Joi = require(`joi`)
const chalk = require(`chalk`)
const _ = require(`lodash`)

const { gatsbyConfigSchema } = require(`../../joi-schemas/joi`)

const ensurePathFormat = path => {
  let formattedPath = path
  if (!_.startsWith(formattedPath, `/`)) {
    formattedPath = `/${formattedPath}`
  }
  if (_.endsWith(formattedPath, `/`)) {
    formattedPath = formattedPath.slice(0, -1)
  }
  return formattedPath
}

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_SITE_CONFIG`: {
      // Validate the config.
      const result = Joi.validate(action.payload, gatsbyConfigSchema)
      // TODO use Redux for capturing errors from different
      // parts of Gatsby so a) can capture richer errors and b) be
      // more flexible how to display them.
      if (result.error) {
        console.log(
          chalk.blue.bgYellow(`The site's gatsby-config.js failed validation`)
        )
        console.log(chalk.bold.red(result.error))
        if (action.payload.linkPrefix) {
          console.log(`"linkPrefix" should be changed to "pathPrefix"`)
        }
        throw new Error(`The site's gatsby-config.js failed validation`)
      }

      // Ensure that the pathPrefix (if set) starts with a forward slash
      // and doesn't end with a slash.
      if (action.payload && action.payload.pathPrefix) {
        action.payload.pathPrefix = ensurePathFormat(action.payload.pathPrefix)
      }

      // If pathPrefix isn't set, set it to an empty string
      // to avoid it showing up as undefined elsewhere.
      if (!_.has(action, [`payload`, `pathPrefix`])) {
        action = _.set(action, [`payload`, `pathPrefix`], ``)
      }

      // Ensure that the assetPath (if set) starts with a forward slash
      // and doesn't end with a slash.
      if (action.payload && action.payload.assetPath) {
        action.payload.assetPath = ensurePathFormat(action.payload.assetPath)
      }

      // If pathPrefix isn't set, set it to empty string.
      if (!_.has(action, [`payload`, `assetPath`])) {
        action = _.set(action, [`payload`, `assetPath`], ``)
      }

      // Default polyfill to true.
      if (!_.has(action, [`payload`, `polyfill`])) {
        action = _.set(action, [`payload`, `polyfill`], true)
      }

      return {
        ...action.payload,
      }
    }
    default:
      return state
  }
}
