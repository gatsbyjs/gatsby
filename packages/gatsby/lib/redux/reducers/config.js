const Joi = require("joi")
const chalk = require("chalk")

const { gatsbyConfigSchema } = require("../../joi-schemas/joi")
const defaultConfig = {
  rootPath: `/`,
}

module.exports = (state = {}, action) => {
  switch (action.type) {
    case "SET_SITE_CONFIG":
      // Set default config.
      const config = Object.assign({}, defaultConfig, action.payload)
      // Validate the config.
      const result = Joi.validate(config, gatsbyConfigSchema)
      // TODO use Redux for capturing errors from different
      // parts of Gatsby so a) can capture richer errors and b) be
      // more flexible how to display them.
      if (result.error) {
        console.log(
          chalk.blue.bgYellow(`The site's gatsby-config.js failed validation`)
        )
        console.log(chalk.bold.red(result.error))
        console.log(config)
        throw new Error(`The site's gatsby-config.js failed validation`)
        return
      }
      return {
        ...config,
      }
    default:
      return state
  }
}
