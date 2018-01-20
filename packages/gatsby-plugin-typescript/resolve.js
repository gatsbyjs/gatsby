"use strict";

// Split out to allow jest mocking
module.exports = function (module) {
  return require.resolve(module);
};