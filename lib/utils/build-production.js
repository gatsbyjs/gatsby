import webpack from 'webpack'
import webpackConfig from './webpack.config'

module.exports = (program, callback) => {
  const { directory } = program

  // Build production js.
  const compilerConfig = webpackConfig(program, directory, 'production')

  return webpack(compilerConfig.resolve()).run((err, stats) => callback(err, stats))
}
