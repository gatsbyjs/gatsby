"use strict";

/*
  Based on Tobias Koppers @sokra bundle-loader
  https://github.com/webpack/bundle-loader

  and Arthur Stolyar's async-module-loader
*/
var loaderUtils = require("loader-utils");
var path = require("path");

module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();

  var query = loaderUtils.parseQuery(this.query);
  var chunkName = "";

  if (query.name) {
    chunkName = loaderUtils.interpolateName(this, query.name, {
      context: query.context,
      regExp: query.regExp });
    chunkName = ", " + JSON.stringify(chunkName);
  }

  var request = loaderUtils.stringifyRequest(this, "!!" + remainingRequest);

  var callback = "function() { return require(" + request + ") }";

  var executor = "\n     return require.ensure([], function(_, error) {\n        if (error) {\n          console.log('bundle loading error', error)\n          cb(true)\n        } else {\n          cb(null, " + callback + ")\n        }\n      }" + chunkName + ");\n    ";

  var result = "\n    require(\n      " + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "patch.js")) + "\n    );\n    module.exports = function(cb) { " + executor + " }\n    ";

  return result;
};