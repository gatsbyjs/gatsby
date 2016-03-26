require('node-cjsx').transform()
import webpack from 'webpack'
import globPages from './glob-pages'
import webpackConfig from './webpack.config'
const debug = require('debug')('gatsby:static')

module.exports = (program, callback) => {
  const { directory } = program

  globPages(directory, (err, pages) => {
    debug('generating static site')
    const routes = pages.filter((page) => page.path).map((page) => page.path)

    // Static site generation.
    const compilerConfig = webpackConfig(program, directory, 'static', null, routes)

    webpack(compilerConfig.resolve()).run((e, stats) => {
      if (e) {
        return callback(e, stats)
      }
      if (stats.hasErrors()) {
        return callback(`Error: ${stats.toJson().errors}`, stats)
      }
      return callback(null, stats)
    })
  })
}
