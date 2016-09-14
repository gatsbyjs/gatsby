/* @flow weak */
import webpack from 'webpack'
import webpackConfig from './webpack.config'

module.exports = (program, callback) => {
  const { directory } = program

  const compilerConfig = webpackConfig(program, directory, 'build-javascript')

  webpack(compilerConfig.resolve()).run(callback)
}
