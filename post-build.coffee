program = require 'commander'
WebpackDevServer = require 'webpack-dev-server'
webpack = require 'webpack'
path = require 'path'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'
glob = require('glob')
fs = require 'fs-extra'

program
  .option('-h, --host <url>', 'set host. defaults to 0.0.0.0', "0.0.0.0")
  .parse(process.argv)

relativeDirectory = program.args[0]
directory = path.resolve(relativeDirectory)

glob directory + '/pages/**/?(*.md|*.jpg|*.png|*.pdf)', null, (err, files) ->
  for file in files
    newPath = directory + "/public/" + path.relative directory + "/pages", file
    fs.copy(file, newPath, (err) -> console.log err)
