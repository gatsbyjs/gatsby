import path from 'path';
import glob from 'glob';
import fs from 'fs-extra';
import async from 'async';
import parsePath from 'parse-filepath';
import _ from 'underscore';

import globPages from './glob-pages';

module.exports = function(program, cb) {
  var {relativeDirectory, directory} = program;

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
        var newPath = `/${parsed.basename}`;
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
