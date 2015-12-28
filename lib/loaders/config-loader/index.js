'use strict'

import toml from 'toml'
import loaderUtils from 'loader-utils'
import path from 'path'

const globPages = require('../../utils/glob-pages')

module.exports = function (source) {
  this.cacheable()
  const callback = this.async()
  const value = {}
  const directory = loaderUtils.parseQuery(this.query).directory

  // TODO support YAML + JSON + CSON as well here.
  const config = toml.parse(source)
  value.config = config
  value.relativePath = path.relative('.', directory)

  // Load pages.
  return globPages(directory, (err, pagesData) => {
    value.pages = pagesData
    this.value = [value]
    return callback(null, 'module.exports = ' + JSON.stringify(value, undefined, '\t'))
  })
}
