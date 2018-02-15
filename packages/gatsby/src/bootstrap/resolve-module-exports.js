// @flow
const fs = require(`fs`)
const babylon = require(`babylon`)
const traverse = require(`babel-traverse`).default

/**
 * Given a `require.resolve()` compatible path pointing to a JS module,
 * return an array listing the names of the module's exports.
 *
 * Returns [] for invalid paths and modules without exports.
 *
 * @param {string} modulePath
 * @param {function} resolver
 */
module.exports = (modulePath, resolver = require.resolve) => {
  let absPath
  const exportNames = []

  try {
    absPath = resolver(modulePath)
  } catch (err) {
    return exportNames // doesn't exist
  }
  const code = fs.readFileSync(absPath, `utf8`) // get file contents

  const babylonOpts = {
    sourceType: `module`,
    allowImportExportEverywhere: true,
    plugins: [
      `jsx`,
      `doExpressions`,
      `objectRestSpread`,
      `decorators`,
      `classProperties`,
      `exportExtensions`,
      `asyncGenerators`,
      `functionBind`,
      `functionSent`,
      `dynamicImport`,
      `flow`,
    ],
  }

  const ast = babylon.parse(code, babylonOpts)

  // extract names of exports from file
  traverse(ast, {
    AssignmentExpression: function AssignmentExpression(astPath) {
      if (
        astPath.node.left.type === `MemberExpression` &&
        astPath.node.left.object.name === `exports`
      ) {
        exportNames.push(astPath.node.left.property.name)
      }
    },
  })

  return exportNames
}
