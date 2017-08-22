"use strict";

/*  weak */
var logger = require(`tracer`).colorConsole();

var initStarter = require(`./init-starter`);

module.exports = function (rootPath) {
  var starter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `gatsbyjs/gatsby-starter-default`;

  initStarter(starter, { rootPath, logger }).catch(function (error) {
    return logger.error(error);
  });
};