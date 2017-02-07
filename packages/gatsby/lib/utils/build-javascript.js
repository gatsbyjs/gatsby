/* @flow weak */
import webpack from 'webpack'
import Promise from 'bluebird'
import webpackConfig from './webpack.config'

module.exports = async (program) => {
  const { directory } = program

  const compilerConfig = await webpackConfig(program, directory, `build-javascript`)

  return new Promise((resolve) => {
    webpack(compilerConfig.resolve()).run(() => resolve())
  })
}
