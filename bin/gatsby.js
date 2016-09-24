#!/usr/bin/env node

/*eslint-disable */
require('babel-core/register')
require('coffee-script/register')

global.appStartTime = Date.now()

var sysPath = require('path')
var fs = require('fs')
var version = process.version
var versionDigits = version.split('.')
  .map(function (d) { return d.match(/\d+/)[0] })
  .slice(0, 2).join('.')
var verDigit = Number(versionDigits)

if (verDigit < 0.12) {
  console.error(
    'Error: Gatsby 0.13+ requires node.js v4 or higher (you have ' + version + ') ' +
    'Upgrade node to the latest stable release.'
  )
  process.exit()
}

var cwd = sysPath.resolve('.')
var cliFile = sysPath.join('dist', 'bin', 'cli.js')
var localPath = sysPath.join(cwd, 'node_modules', 'gatsby', cliFile)

var loadGatsby = function (path) {
  require(path)
}

var loadGlobalGatsby = function () {
  var commandsToIgnore = ['new', '--help']
  if (commandsToIgnore.indexOf(process.argv[2]) === -1) {
    console.log(
      "A local install of Gatsby was not found.\n" +
      "Generally you should save Gatsby as a site dependency e.g. npm install --save gatsby\n" +
      "Continuing with global install.\n\n"
    )
  }
  fs.realpath(__dirname, function (err, real) {
    if (err) throw err
    loadGatsby(sysPath.join(real, '..', cliFile))
  })
}

fs.access(localPath, function (error) {
  if (error) {
    loadGlobalGatsby()
  } else {
    try {
      loadGatsby(localPath)
    } catch(error) {
      console.log(
        'Gatsby: Local install exists but failed to load it. ' +
        'Continuing with global install:', error
      )
      loadGlobalGatsby()
    }
  }
})
