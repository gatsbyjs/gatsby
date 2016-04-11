#!/usr/bin/env node

var path = require('path')
var fs = require('fs-extra')
var Promise = require('bluebird')

var mkdir = Promise.promisify(fs.mkdir)
var symlink = Promise.promisify(fs.symlink)
var readdir = Promise.promisify(fs.readdir)
var remove = Promise.promisify(fs.remove)

var nodeModulesDirectory = path.join(process.cwd(), 'node_modules')
var gatsbyDirectory = path.join(nodeModulesDirectory, 'gatsby')
var fixturesDirectory = path.join(process.cwd(), 'test', 'fixtures')

function linkNodeModules (directory) {
  var fixtureNodeModules = path.join(fixturesDirectory, directory, 'node_modules')

  return remove(fixtureNodeModules)
    .then(function() { symlink(nodeModulesDirectory, fixtureNodeModules) })
}

function linkGatsby () {
  var gatsbyPackagePath = path.join(process.cwd(), 'package.json')
  var gatsbyDistPath = path.join(process.cwd(), 'dist')
  var fixturePackagePath = path.join(gatsbyDirectory, 'package.json')
  var fixtureDistPath = path.join(gatsbyDirectory, 'dist')

  return remove(gatsbyDirectory)
    .then(function () { return mkdir(gatsbyDirectory) })
    .then(function () {
      return Promise.all([
        symlink(gatsbyPackagePath, fixturePackagePath),
        symlink(gatsbyDistPath, fixtureDistPath)
      ])
    })
}

linkGatsby()
  .then(function () { return readdir(fixturesDirectory) })
  .then(function (fixtures) { return fixtures.map(linkNodeModules) })
