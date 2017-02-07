import _ from "lodash"
import invariant from "invariant"
import path from "path"
import validate from "webpack-validator"
import apiRunnerNode from "./api-runner-node"

export default (async function ValidateWebpackConfig (config, stage) {
  // We don't care about the return as plugins just mutate the config directly.
  await apiRunnerNode(`modifyWebpackConfig`, { config, stage })

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

  return process.exit(1)
});
