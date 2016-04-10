'use strict';

// This file is auto-written and used by Gatsby to require
// files from your pages directory.
module.exports = function (callback) {
  var context = require.context('./pages', true);
  if (module.hot) {
    module.hot.accept(context.id, function () {
      context = require.context('./pages', true);
      return callback(context);
    });
  }
  return callback(context);
};