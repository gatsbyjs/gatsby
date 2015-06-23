toml = require('toml')
loaderUtils = require('loader-utils')
Router = require 'react-router'
path = require 'path'

globPages = require '../../utils/glob-pages'

module.exports = (source) ->
  @cacheable()
  callback = @async()

  value = {}

  directory = loaderUtils.parseQuery(@query).directory

  # TODO support YAML + JSON + CSON as well here.
  config = toml.parse(source)
  value.config = config
  value.relativePath = path.relative('.', directory)

  # Load pages.
  globPages directory, (err, pagesData) ->
    value.pages = pagesData
    @value = [value]
    callback null, 'module.exports = ' + JSON.stringify(value, undefined, "\t")
