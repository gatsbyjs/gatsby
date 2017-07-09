import _ from "lodash"
import invariant from "invariant"
import path from "path"
import validate, { Joi } from "webpack-validator"
import apiRunnerNode from "./api-runner-node"

// We whitelist special config keys that are not part of a standard Webpack v1
// config but are in common usage. We should be able to completely remove this
// once we're on Webpack v3.
//
// For info on whitelisting with webpack-validator see:
// https://github.com/js-dxtools/webpack-validator#customizing
const validationWhitelist = Joi.object({
  stylus: Joi.object({
    use: Joi.any(),
  }),
})

export default (async function ValidateWebpackConfig(config, stage) {
  // We don't care about the return as plugins just mutate the config directly.
  await apiRunnerNode(`modifyWebpackConfig`, { config, stage })

  // console.log(JSON.stringify(config, null, 4))

  invariant(
    _.isObject(config) && _.isFunction(config.resolve),
    `
    You must return an webpack-configurator instance when modifying the Webpack config.
    Returned: ${config}
    stage: ${stage}
    `
  )

  const validationState = validate(config.resolve(), {
    returnValidation: true,
    schemaExtension: validationWhitelist,
  })

  if (!validationState.error) {
    return config
  }

  console.log(`There were errors with your webpack config:`)
  validationState.error.details.forEach((err, index) => {
    console.log(`[${index + 1}]`)
    console.log(err.path)
    console.log(err.type, `,`, err.message)
    console.log(`\n`)
  })

  console.log(
    `Your Webpack config does not appear to be valid. This could be because of
something you added or a plugin. If you don't recognize the invalid keys listed
above try removing plugins and rebuilding to identify the culprit.
`
  )

  return process.exit(1)
})
