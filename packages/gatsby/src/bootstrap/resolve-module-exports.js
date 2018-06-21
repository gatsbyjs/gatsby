// @flow
const fs = require(`fs`)
const babylon = require(`@babel/parser`)
const traverse = require(`babel-traverse`).default
const get = require(`lodash/get`)

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
    // get foo from `export const foo = bar`
    ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
      const exportName = get(
        astPath,
        `node.declaration.declarations[0].id.name`
      )
      if (exportName) exportNames.push(exportName)
    },
    AssignmentExpression: function AssignmentExpression(astPath) {
      const nodeLeft = astPath.node.left

      if (nodeLeft.type !== `MemberExpression`) return

      // get foo from `exports.foo = bar`
      if (get(nodeLeft, `object.name`) === `exports`) {
        exportNames.push(nodeLeft.property.name)
      }

      // get foo from `module.exports.foo = bar`
      if (
        get(nodeLeft, `object.object.name`) === `module` &&
        get(nodeLeft, `object.property.name`) === `exports`
      ) {
        exportNames.push(nodeLeft.property.name)
      }
    },
  })

  return exportNames
}
