import webpack from 'webpack'
import webpackConfig from './webpack.config'
import getUserGatsbyConfig from './get-user-gatsby-config'

module.exports = (program, callback) => {
  const { directory } = program

  // Build production js.
  const compilerConfig = webpackConfig(program, directory, 'production')
  const config = getUserGatsbyConfig(compilerConfig, 'production')

  return webpack(config.resolve()).run((err, stats) => callback(err, stats))
}
