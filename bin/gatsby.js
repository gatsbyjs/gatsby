#!/usr/bin/env node

/*eslint-disable */
require('babel-core/register')

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
    'Error: Gatsby 0.9+ requires node.js v0.12 or higher (you have ' + version + ') ' +
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
      console.error(
        'Gatsby: Local install exists but failed to load it. ' +
        'Continuing with global install:', error
      )
      loadGlobalGatsby()
    }
  }
})
