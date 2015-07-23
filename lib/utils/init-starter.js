'use strict';
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var sysPath = require('path');
var rimraf = require('rimraf');
var ncp = require('ncp');

var logger = console;
var commandName = 'init-starter';

// Shortcut for backwards-compat fs.exists.
var fsexists = fs.exists || sysPath.exists;

// Executes `npm install` and `bower install` in rootPath.
//
// rootPath - String. Path to directory in which command will be executed.
// callback - Function. Takes stderr and stdout of executed process.
//
// Returns nothing.
var install = function(rootPath, callback) {
  var prevDir = process.cwd();
  logger.log('Installing packages...');
  process.chdir(rootPath);
  fsexists('bower.json', function(exists) {
    var installCmd = 'npm install';
    if (exists) installCmd += ' & bower install';
    exec(installCmd, function(error, stdout, stderr) {
      var log;
      process.chdir(prevDir);
      if (stdout) console.log(stdout.toString());
      if (error != null) {
        log = stderr.toString();
        var bowerNotFound = /bower\: command not found/.test(log);
        var msg = bowerNotFound ? 'You need to install Bower and then install starter dependencies: `npm install -g bower && bower install`. Error text: ' + log : log;
        return callback(new Error(msg));
      }
      callback(null, stdout);
    });
  });
};

var ignored = function(path) {
  return !(/^\.(git|hg)$/.test(sysPath.basename(path)));
};

// Copy starter from file system.
//
// starterPath   - String, file system path from which files will be taken.
// rootPath     - String, directory to which starter files will be copied.
// callback     - Function.
//
// Returns nothing.
var copy = function(starterPath, rootPath, callback) {
  var copyDirectory = function() {
    ncp(starterPath, rootPath, {filter: ignored, stopOnErr: true}, function(error) {
      if (error != null) return callback(new Error(error));
      logger.log('Created starter directory layout');
      install(rootPath, callback);
    });
  };

  // Chmod with 755.
  mkdirp(rootPath, 0x1ed, function(error) {
    if (error != null) return callback(new Error(error));
    fsexists(starterPath, function(exists) {
      if (!exists) {
        var error = "starter '" + starterPath + "' doesn't exist";
        return callback(new Error(error));
      }
      logger.log('Copying local starter to "' + rootPath + '"...');

      copyDirectory();
    });
  });
};

// Clones starter from URI.
//
// address     - String, URI. https:, github: or git: may be used.
// rootPath    - String, directory to which starter files will be copied.
// callback    - Function.
//
// Returns nothing.
var clone = function(address, rootPath, callback) {
  var gitHubRe = /(gh|github)\:(?:\/\/)?/;
  var url = gitHubRe.test(address) ?
    ("git://github.com/" + address.replace(gitHubRe, '') + ".git") : address;
  logger.log('Cloning git repo "' + url + '" to "' + rootPath + '"...');
  var cmd = 'git clone ' + url + ' "' + rootPath + '"';
  exec(cmd, function(error, stdout, stderr) {
    if (error != null) {
      return callback(new Error("Git clone error: " + stderr.toString()));
    }
    logger.log('Created starter directory layout');
    rimraf(sysPath.join(rootPath, '.git'), function(error) {
      if (error != null) return callback(new Error(error));
      install(rootPath, callback);
    });
  });
};

// Main function that clones or copies the starter.
//
// starter    - String, file system path or URI of starter.
// rootPath    - String, directory to which starter files will be copied.
// callback    - Function.
//
// Returns nothing.
var initStarter = function(starter, options, callback) {
  var cwd = process.cwd();

  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (options === null) options = {};
  var rootPath = options.rootPath || cwd;
  if (options.commandName) commandName = options.commandName;
  if (options.logger) logger = options.logger;

  if (starter === '.' && rootPath === cwd) starter = null;
  if (callback === null) callback = function(error) {
    if (error !== null) return logger.error(error.toString());
  };

  var uriRe = /(?:https?|git(hub)?|gh)(?::\/\/|@)?/;
  fsexists(sysPath.join(rootPath, 'package.json'), function(exists) {
    if (exists) {
      return callback(new Error("Directory '" + rootPath + "' is already an npm project"));
    }
    var isGitUri = starter && uriRe.test(starter);
    var get = isGitUri ? clone : copy;
    get(starter, rootPath, callback);
  });
};

module.exports = initStarter;
