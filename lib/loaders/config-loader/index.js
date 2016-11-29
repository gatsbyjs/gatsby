/* @flow weak */
const loaderUtils = require('loader-utils')
const path = require('path')
const globPages = require('../../utils/glob-pages')
const loadConfig = require('../../utils/load-config')

module.exports = function () {
  this.cacheable()
  const callback = this.async()
  const directory = loaderUtils.parseQuery(this.query).directory
  const config = loadConfig(directory)

  const value = {}
  value.config = config
  value.relativePath = path.relative('.', directory)
  globPages(directory, (err, pagesData) => {
    value.pages = pagesData
    return callback(null, `module.exports = ${JSON.stringify(value, void 0, '\t')}`)
  })
}
