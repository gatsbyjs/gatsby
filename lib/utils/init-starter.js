const exec = require('child_process').exec
import fs from 'fs'
import mkdirp from 'mkdirp'
import sysPath from 'path'
import rimraf from 'rimraf'
import ncp from 'ncp'

let logger = console

// Shortcut for backwards-compat fs.exists.
const fsexists = fs.exists || sysPath.exists

// Executes `npm install` and `bower install` in rootPath.
//
// rootPath - String. Path to directory in which command will be executed.
// callback - Function. Takes stderr and stdout of executed process.
//
// Returns nothing.
const install = (rootPath, callback) => {
  const prevDir = process.cwd()
  logger.log('Installing packages...')
  process.chdir(rootPath)
  fsexists('bower.json', (exists) => {
    let installCmd = 'npm install'
    if (exists) installCmd += ' & bower install'
    exec(installCmd, (error, stdout, stderr) => {
      let log
      process.chdir(prevDir)
      if (stdout) console.log(stdout.toString())
      if (error !== null) {
        log = stderr.toString()
        const bowerNotFound = /bower\: command not found/.test(log)
        const msg = bowerNotFound ? 'You need to install Bower and then install starter dependencies: `npm install -g bower && bower install`. Error text: ' + log : log
        return callback(new Error(msg))
      }
      callback(null, stdout)
    })
  })
}

const ignored = (path) => {
  return !(/^\.(git|hg)$/.test(sysPath.basename(path)))
}

// Copy starter from file system.
//
// starterPath   - String, file system path from which files will be taken.
// rootPath     - String, directory to which starter files will be copied.
// callback     - Function.
//
// Returns nothing.
const copy = (starterPath, rootPath, callback) => {
  const copyDirectory = () => {
    ncp(starterPath, rootPath, {filter: ignored, stopOnErr: true}, (error) => {
      if (error !== null) return callback(new Error(error))
      logger.log('Created starter directory layout')
      install(rootPath, callback)
    })
  }

  // Chmod with 755.
  mkdirp(rootPath, 0x1ed, (error) => {
    if (error !== null) return callback(new Error(error))
    fsexists(starterPath, (exists) => {
      if (!exists) {
        const chmodError = 'starter ' + starterPath + " doesn't exist"
        return callback(new Error(chmodError))
      }
      logger.log('Copying local starter to ' + rootPath + '...')

      copyDirectory()
    })
  })
}

// Clones starter from URI.
//
// address     - String, URI. https:, github: or git: may be used.
// rootPath    - String, directory to which starter files will be copied.
// callback    - Function.
//
// Returns nothing.
const clone = (address, rootPath, callback) => {
  const gitHubRe = /(gh|github)\:(?:\/\/)?/
  const url = gitHubRe.test(address) ?
    ('git://github.com/' + address.replace(gitHubRe, '') + '.git') : address
  logger.log('Cloning git repo ' + url + ' to ' + rootPath + '...')
  const cmd = 'git clone ' + url + ' ' + rootPath
  exec(cmd, (error, stdout, stderr) => {
    if (error !== null) {
      return callback(new Error('Git clone error: ' + stderr.toString()))
    }
    logger.log('Created starter directory layout')
    rimraf(sysPath.join(rootPath, '.git'), (rimRafError) => {
      if (error !== null) return callback(new Error(rimRafError))
      install(rootPath, callback)
    })
  })
}

// Main function that clones or copies the starter.
//
// starter    - String, file system path or URI of starter.
// rootPath    - String, directory to which starter files will be copied.
// callback    - Function.
//
// Returns nothing.
const initStarter = (starter, options = {}, callback) => {
  const cwd = process.cwd()
  const rootPath = options.rootPath || cwd
  if (options.logger) logger = options.logger

  const uriRe = /(?:https?|git(hub)?|gh)(?::\/\/|@)?/
  fsexists(sysPath.join(rootPath, 'package.json'), (exists) => {
    if (exists) {
      return callback(new Error('Directory ' + rootPath + ' is already an npm project'))
    }
    const isGitUri = starter && uriRe.test(starter)
    const get = isGitUri ? clone : copy
    get(starter, rootPath, callback)
  })
}

module.exports = initStarter
