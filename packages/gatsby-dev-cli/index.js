"use strict";

var chokidar = require("chokidar");
var _ = require("lodash");
var fs = require("fs-extra");
var syspath = require("path");

var ignoreRegs = [/[\/\\]node_modules[\/\\]/i, /\.git/i, /[\/\\]src[\/\\]/i];

module.exports = function (root, packages) {
  packages.forEach(function (p) {
    var prefix = `${root}/packages/${p}`;
    chokidar.watch(prefix, {
      ignored: [function (path, stats) {
        return _.some(ignoreRegs, function (reg) {
          return reg.test(path);
        });
      }]
    }).on("all", function (event, path) {
      if (event === "change" || event === "add") {
        // Copy it over local version.
        var newPath = syspath.join(`./node_modules/${p}`, syspath.relative(prefix, path));
        fs.copy(path, newPath, function (err) {
          if (err) console.error(err);
          console.log(`copied ${path} to ${newPath}`);
        });
      }
    });
  });
};