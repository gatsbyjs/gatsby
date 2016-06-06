/* @flow weak */
// This file is auto-written and used by Gatsby to require
// files from your pages directory.
module.exports = function (callback) {
  let context = require.context('./pages', true)
  if (module.hot) {
    module.hot.accept(context.id, () => {
      context = require.context('./pages', true)
      return callback(context)
    })
  }
  return callback(context)
}
