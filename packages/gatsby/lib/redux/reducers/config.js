const Joi = require("joi")
const chalk = require("chalk")

const { gatsbyConfigSchema } = require("../../joi-schemas/joi")

module.exports = (state = {}, action) => {
  switch (action.type) {
    case "SET_SITE_CONFIG":
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
        console.log(action.payload)
        throw new Error(`The site's gatsby-config.js failed validation`)
        return
      }
      return {
        ...action.payload,
      }
    default:
      return state
  }
}
