const toml = require('toml')
const loaderUtils = require('loader-utils')
const path = require('path')
const globPages = require('../../utils/glob-pages')

module.exports = function (source) {
  this.cacheable()
  const callback = this.async()
  const directory = loaderUtils.parseQuery(this.query).directory
  const config = toml.parse(source)

  let value
  value = {}
  value.config = config
  value.relativePath = path.relative('.', directory)
  return globPages(directory, (function (_this) {
    return function (err, pagesData) {
      value.pages = pagesData
      _this.value = [value]
      return callback(null, 'module.exports = ' + JSON.stringify(value, void 0, '\t'))
    }
  })(this))
}
