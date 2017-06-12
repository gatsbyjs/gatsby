const Joi = require(`joi`)
const chalk = require(`chalk`)
const _ = require(`lodash`)

const { gatsbyConfigSchema } = require(`../../joi-schemas/joi`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_SITE_CONFIG`:
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
        if (action.payload.linkPrefix) {
          console.log(`"linkPrefix" should be changed to "pathPrefix"`)
        }
        throw new Error(`The site's gatsby-config.js failed validation`)
      }

      // Ensure that the pathPrefix (if set) starts with a forward slash
      // and doesn't end with a slash.
      if (action.payload && action.payload.pathPrefix) {
        if (!_.startsWith(action.payload.pathPrefix, `/`)) {
          action.payload.pathPrefix = `/${action.payload.pathPrefix}`
        }
        if (_.endsWith(action.payload.pathPrefix, `/`)) {
          action.payload.pathPrefix = action.payload.pathPrefix.slice(0, -1)
        }
      }

      console.log(`config`, action.payload)

      return {
        ...action.payload,
      }
    default:
      return state
  }
}
