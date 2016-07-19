/* @flow weak */
// This file is auto-written and used by Gatsby to require
// files from your pages directory.
module.exports = function (callback) {
  let context = require.context('./pages', true, /(coffee|cjsx|jsx|js|markdown|md|html|json|yaml|toml)$/)
  if (module.hot) {
    module.hot.accept(context.id, () => {
      context = require.context('./pages', true, /(coffee|cjsx|jsx|js|markdown|md|html|json|yaml|toml)$/)
      return callback(context)
    })
  }
  return callback(context)
}
