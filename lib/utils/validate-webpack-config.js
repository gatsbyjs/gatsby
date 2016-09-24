import _ from 'lodash'
import invariant from 'invariant'
import path from 'path'
import validate from 'webpack-validator'

let modifyWebpackConfig
try {
  const gatsbyNodeConfig = path.resolve(process.cwd(), './gatsby-node')
  const nodeConfig = require(gatsbyNodeConfig)
  modifyWebpackConfig = nodeConfig.modifyWebpackConfig
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' && !_.includes(e.Error, 'gatsby-node')) {
    console.log(e)
  }
}

export default function ValidateWebpackConfig (module, config, stage) {
  let userWebpackConfig = module(config)
  if (modifyWebpackConfig) {
    userWebpackConfig = modifyWebpackConfig(userWebpackConfig, stage)

    invariant(_.isObject(userWebpackConfig) && _.isFunction(userWebpackConfig.resolve),
      `
      You must return an webpack-configurator instance when modifying the Webpack config.
      Returned: ${userWebpackConfig}
      stage: ${stage}
      `)
  }

  const validationState = validate(userWebpackConfig.resolve(), {
    returnValidation: true,
  })

  if (!validationState.error) {
    return userWebpackConfig
  }

  console.log('There were errors with your webpack config:')
  validationState.error.details.forEach((err, index) => {
    console.log(`[${index + 1}]`)
    console.log(err.path)
    console.log(err.type, ',', err.message)
    console.log('\n')
  })

  return process.exit(1)
}
