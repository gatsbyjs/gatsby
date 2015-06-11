glob = require('glob')
path = require 'path'
parsePath = require 'parse-filepath'
fs = require 'fs'
frontMatter = require 'front-matter'
_ = require 'underscore'

module.exports = (directory, callback) ->
  pagesData = []

  glob directory + '/pages/**/?(*.coffee|*.cjsx|*.jsx|*.md|*.html)', null, (err, pages) =>
    if err then return callback(err)

    for page in pages
      # Ignore template pages.
      if page.indexOf('/pages/app') > -1
        continue

      pageData = {}

      parsed = parsePath(path.relative(directory + "/pages", page))

      pageData.ext = ext = parsed.extname.slice(1)

      # Determine require path
      relativePath = path.relative(directory, page)
      pageData.requirePath = path.relative(directory + "/pages", page)

      # Load data for each file type.
      if ext is "md"
        rawData = frontMatter(fs.readFileSync(page, 'utf-8'))
        data = _.extend {}, rawData.attributes
        pageData.data = data
      else
        data = {}

      # Determine path for page.
      if data.path
        # Path was hardcoded.
        pageData.path = data.path
      else
        # If this is an index page, it's path is /foo/bar/
        if parsed.name is "index"
          if parsed.dirname is "."
            pageData.path = "/"
          else
            pageData.path = "/" + parsed.dirname + "/"
        # Else if not an index, create a path like /foo/bar.html
        else
          if parsed.dirname is "."
            pageData.path = "/" + parsed.name + ".html"
          else
            pageData.path = "/" + parsed.dirname + "/" + parsed.name + ".html"

      pagesData.push pageData

    callback(null, pagesData)

