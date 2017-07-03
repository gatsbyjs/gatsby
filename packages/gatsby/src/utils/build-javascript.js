/* @flow */
import webpack from 'webpack'
import Promise from 'bluebird'
import webpackConfig from './webpack.config'

const { store } = require(`../redux`)

module.exports = async program => {
  const pages = store.getState().pages

  const compilerConfig = await webpackConfig(`build-javascript`, {
    program,
    pages,
  })

  return new Promise(resolve => {
    webpack(compilerConfig.resolve()).run(() => resolve())
  })
}
