/* @flow weak */
import webpack from 'webpack'
import webpackConfig from './webpack.config'

module.exports = (program, callback) => {
  const { directory } = program

  const compilerConfig = webpackConfig(program, directory, `build-javascript`)
  console.log('webpack config for JS', JSON.stringify(compilerConfig.resolve(), null, 4))

  webpack(compilerConfig.resolve()).run(callback)
}
