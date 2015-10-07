var path = require('path');
var glob = require('glob');
var fs = require('fs-extra');
var async = require('async');
var parsePath = require('parse-filepath');
var _ = require('underscore');

var globPages = require('./glob-pages');

module.exports = function(program, cb) {
  var relativeDirectory = program.relativeDirectory;
  var directory = program.directory;

  return globPages(directory, function(err, pages) {

    // Async callback to copy each file.
    var copy = function(file, callback) {
      // Map file to path generated for that directory.
      // e.g. if file is in directory 2015-06-16-my-sweet-blog-post that got
      // rewritten to my-sweet-blog-post, we find that path rewrite so
      // our asset gets copied to the right directory.
      var parsed = parsePath(file);
      var relativePath = path.relative(directory + "/pages", file);
      var oldPath = parsePath(relativePath).dirname;

      // Wouldn't rewrite basePath
      if (oldPath === ".") {
        oldPath = "/";
        var newPath = "/" + parsed.basename;
      }

      if (!(oldPath === "/")) {
        var page = _.find(pages, function(page) {
          // Ignore files that start with underscore (they're not pages).
          if (page.file.name.slice(0,1) !== '_') {
            return parsePath(page.requirePath).dirname === oldPath;
          }
        });

        newPath = parsePath(page.path).dirname + parsed.basename;
      }

      newPath = directory + "/public/" + newPath;
      return fs.copy(file, newPath, function(err) {
        return callback(err);
      }
      );
    };

    // Copy static assets to public folder.
    return glob(directory + '/pages/**/?(*.jpg|*.png|*.pdf|*.gif|*.ico)', null, function(err, files) {
      return async.map(files, copy, function(err, results) {
        return cb(err, results);
      });
    });
  });
};
