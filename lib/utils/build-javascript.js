/* @flow weak */
import webpack from 'webpack'
import webpackConfig from './webpack.config'

module.exports = (program, callback) => {
  const { directory } = program

  const compilerConfig = webpackConfig(program, directory, `build-javascript`)
  console.log('webpack config for JS', compilerConfig.resolve())

  webpack(compilerConfig.resolve()).run(callback)
}
