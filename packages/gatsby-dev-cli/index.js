"use strict";

var chokidar = require("chokidar");
var _ = require("lodash");
var fs = require("fs-extra");
var syspath = require("path");

var ignoreRegs = [new RegExp(`\/node_modules\/`, "i"), new RegExp(`\.git`, "i"), new RegExp(`\/src\/`, "i")];

module.exports = function (root, packages) {
  packages.forEach(function (p) {
    var prefix = `${root}/packages/${p}`;
    chokidar.watch(prefix, {
      ignored: [function (path, stats) {
        // console.log("path", path, stats);
        return _.some(ignoreRegs, function (reg) {
          return reg.test(path);
        });
      }]
    }).on("all", function (event, path) {
      if (event === "change" || event === "add") {
        // Copy it over local version.
        // console.log(syspath.relative(prefix, path));
        var newPath = syspath.join(`./node_modules/${p}`, syspath.relative(prefix, path));
        // console.log("new path", newPath);
        fs.copySync(path, newPath);
        console.log(`copied ${path} to ${newPath}`);
      }
      // console.log(event, path);
    });
  });
};