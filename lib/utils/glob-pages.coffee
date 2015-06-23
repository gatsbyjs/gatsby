glob = require('glob')
path = require 'path'
parsePath = require 'parse-filepath'
fs = require 'fs'
frontMatter = require 'front-matter'
_ = require 'underscore'

module.exports = (directory, callback) ->
  pagesData = []

  app = require directory + "/app"

  glob directory + '/pages/**/?(*.coffee|*.cjsx|*.jsx|*.md|*.html)', null, (err, pages) =>
    if err then return callback(err)

    for page in pages
      pageData = {}
      pageData.file = {}

      pageData.file = parsed = parsePath(path.relative(directory + "/pages", page))

      pageData.file.ext = ext = parsed.extname.slice(1)

      # Determine require path
      relativePath = path.relative(directory, page)
      pageData.requirePath = path.relative(directory + "/pages", page)

      # Load data for each file type.
      if ext is "md"
        rawData = frontMatter(fs.readFileSync(page, 'utf-8'))
        data = _.extend {}, rawData.attributes
        pageData.data = data
      else if ext is "html"
        pageData.data = fs.readFileSync(page, 'utf-8')
      else
        data = {}

      # Determine path for page (unless it's a file that starts with an
      # underscore as these don't become pages).
      unless parsed.name.slice(0,1) is "_"
        if data.path
          # Path was hardcoded.
          pageData.path = data.path
        else if app.rewritePath
          pageData.path = app.rewritePath(parsed, pageData)

        # If none of the above options set a path.
        unless pageData.path?
          # If this is an index page or template, it's path is /foo/bar/
          if parsed.name is "index" or parsed.name is "template"
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

