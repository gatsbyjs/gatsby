const toml = require('toml')
const loaderUtils = require('loader-utils')
const path = require('path')
const globPages = require('../../utils/glob-pages')

module.exports = function (source) {
  this.cacheable()
  const callback = this.async()
  const directory = loaderUtils.parseQuery(this.query).directory
  const config = toml.parse(source)

  const value = {}
  value.config = config
  value.relativePath = path.relative('.', directory)
  globPages(directory, (err, pagesData) => {
    value.pages = pagesData
    return callback(null, `module.exports = ${JSON.stringify(value, void 0, '\t')}`)
  })
}
