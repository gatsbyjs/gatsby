/* @flow weak */
import webpack from 'webpack'
import Promise from 'bluebird'
import fs from 'fs'
import webpackConfig from './webpack.config'
import { pagesDB } from './globals'

const debug = require(`debug`)(`gatsby:html`)
require(`node-cjsx`).transform()

module.exports = async (program) => {
  const { directory } = program

  debug(`generating static HTML`)
  // Reduce pages objects to an array of paths.
  const pages = [...pagesDB().values()].map((page) => page.path)

  // Static site generation.
  const compilerConfig = await webpackConfig(program, directory, `build-html`, null, pages)

  return new Promise((resolve, reject) => {
    webpack(compilerConfig.resolve()).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      if (stats.hasErrors()) {
        return reject(`Error: ${stats.toJson().errors}`, stats)
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      fs.unlinkSync(`${directory}/public/render-page.js`)

      return resolve(null, stats)
    })
  })
}
