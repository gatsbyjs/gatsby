path = require 'path'
glob = require('glob')
fs = require 'fs-extra'
async = require 'async'
parsePath = require 'parse-filepath'
_ = require 'underscore'

globPages = require './glob-pages'

module.exports = (program, cb) ->
  {relativeDirectory, directory} = program

  globPages directory, (err, pages) ->

    # Async callback to copy each file.
    copy = (file, callback) ->
      # Map file to path generated for that directory.
      # e.g. if file is in directory 2015-06-16-my-sweet-blog-post that got
      # rewritten to my-sweet-blog-post, we find that path rewrite so
      # our asset gets copied to the right directory.
      parsed = parsePath file
      relativePath = path.relative(directory + "/pages", file)
      oldPath = parsePath(relativePath).dirname

      # Wouldn't rewrite basePath
      if oldPath is "."
        oldPath = "/"
        newPath = "/#{parsed.basename}"

      unless oldPath is "/"
        page = _.find pages, (page) ->
          # Ignore files that start with underscore (they're not pages).
          if page.file.name.slice(0,1) isnt '_'
            parsePath(page.requirePath).dirname is oldPath

        if page?
          newPath = parsePath(page.path).dirname + parsed.basename

        # If a page wasn't found, this probably means the asset is in
        # a folder without a page e.g. an images directory. In this case,
        # there is no path rewriting so just copy to a directory with
        # the same name.
        else
          relativePath = path.relative(directory + "/pages", parsed.dirname)
          newPath = "#{relativePath}/#{parsed.basename}"

      newPath = directory + "/public/" + newPath
      fs.copy(file, newPath, (err) ->
        callback err
      )

    # Copy static assets to public folder.
    glob directory + '/pages/**/?(*.jpg|*.png|*.svg|*.pdf|*.gif|*.ico|*.txt)', null, (err, files) ->
      async.map files, copy, (err, results) ->
        cb(err, results)
