path = require 'path'
glob = require('glob')
fs = require 'fs-extra'
async = require 'async'

module.exports = (program, cb) ->
  {relativeDirectory, directory} = program

  copy = (file, callback) ->
    newPath = directory + "/public/" + path.relative directory + "/pages", file
    fs.copy(file, newPath, (err) ->
      callback err
    )

  # Copy static assets to public folder.
  glob directory + '/pages/**/?(*.jpg|*.png|*.pdf)', null, (err, files) ->
    async.map files, copy, (err, results) ->
      cb(err, results)
