glob = require('glob')
path = require 'path'
parsePath = require 'parse-filepath'
fs = require 'fs'
frontMatter = require 'front-matter'
_ = require 'underscore'
toml = require('toml')

module.exports = (directory, callback) ->
  # Read in site config.
  try
    siteConfig = toml.parse(fs.readFileSync(directory + "/config.toml"))

  pagesData = []

  app = require directory + "/app"

  # Make this easy to add to through the config?
  # Or just keep adding extensions...?
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
          # Else if not an index, create a path like /foo/bar
          # and rely upon static-site-generator-webpack-plugin to add index.html
          else
            
            if parsed.dirname is "."
              pageData.path = "/" + parsed.name
            else
              pageData.path = "/" + parsed.dirname + "/" + parsed.name

      # Set the "template path"
      else if parsed.name is "_template"
        pageData.templatePath = "/" + parsed.dirname + "/"

      # If we're building for gh-pages
      if process.env.GATSBY_ENV is "gh-pages" and
          siteConfig.ghPagesURLPrefix?
        if pageData.path
          pageData.path = siteConfig.ghPagesURLPrefix + pageData.path
        else if pageData.templatePath
          pageData.templatePath =
            siteConfig.ghPagesURLPrefix + pageData.templatePath

      pagesData.push pageData

    callback(null, pagesData)

