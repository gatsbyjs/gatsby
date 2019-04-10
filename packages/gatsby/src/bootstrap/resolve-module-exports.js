// @flow
const fs = require(`fs`)
const traverse = require(`@babel/traverse`).default
const get = require(`lodash/get`)
const { codeFrameColumns } = require(`@babel/code-frame`)
const { babelParseToAst } = require(`../utils/babel-parse-to-ast`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

const { dispatch } = store
const { log } = actions

const staticallyAnalyzeExports = (modulePath, resolver = require.resolve) => {
  let absPath
  const exportNames = []

  try {
    absPath = resolver(modulePath)
  } catch (err) {
    return exportNames // doesn't exist
  }
  const code = fs.readFileSync(absPath, `utf8`) // get file contents

  let ast
  try {
    ast = babelParseToAst(code, absPath)
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Pretty print syntax errors
      const codeFrame = codeFrameColumns(
        code,
        {
          start: err.loc,
        },
        {
          highlightCode: true,
        }
      )

      const message =
        `Syntax error in "${absPath}":\n` + `${err.message}\n${codeFrame}`
      dispatch(log({ message, type: `panic` }))
    } else {
      // if it's not syntax error, just throw it
      throw err
    }
  }

  let isCommonJS = false
  let isES6 = false

  // extract names of exports from file
  traverse(ast, {
    // Check if the file is using ES6 imports
    ImportDeclaration: function ImportDeclaration(astPath) {
      isES6 = true
    },

    // get foo from `export const foo = bar`
    ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
      const exportName = get(
        astPath,
        `node.declaration.declarations[0].id.name`
      )
      isES6 = true
      if (exportName) exportNames.push(exportName)
    },

    // get foo from `export { foo } from 'bar'`
    // get foo from `export { foo }`
    ExportSpecifier: function ExportSpecifier(astPath) {
      const exportName = get(astPath, `node.exported.name`)
      isES6 = true
      if (exportName) exportNames.push(exportName)
    },

    AssignmentExpression: function AssignmentExpression(astPath) {
      const nodeLeft = astPath.node.left

      if (nodeLeft.type !== `MemberExpression`) return

      // ignore marker property `__esModule`
      if (get(nodeLeft, `property.name`) === `__esModule`) return

      // get foo from `exports.foo = bar`
      if (get(nodeLeft, `object.name`) === `exports`) {
        isCommonJS = true
        exportNames.push(nodeLeft.property.name)
      }

      // get foo from `module.exports.foo = bar`
      if (
        get(nodeLeft, `object.object.name`) === `module` &&
        get(nodeLeft, `object.property.name`) === `exports`
      ) {
        isCommonJS = true
        exportNames.push(nodeLeft.property.name)
      }
    },
  })

  if (isES6 && isCommonJS && process.env.NODE_ENV !== `test`) {
    const message =
      `This plugin file is using both CommonJS and ES6 module systems together ` +
      `which we don't support. You'll need to edit the file to use just one or ` +
      `the other.\n\n` +
      `Plugin: ${modulePath}.js\n\n` +
      `This didn't cause a problem in Gatsby v1 so you might want to review ` +
      `the migration doc for this: https://gatsby.dev/no-mixed-modules`
    dispatch(log({ message, type: `panic` }))
  }
  return exportNames
}

/**
 * Given a `require.resolve()` compatible path pointing to a JS module,
 * return an array listing the names of the module's exports.
 *
 * Returns [] for invalid paths and modules without exports.
 *
 * @param {string} modulePath
 * @param {string} mode
 * @param {function} resolver
 */
module.exports = (modulePath, { mode = `analysis`, resolver } = {}) => {
  if (mode === `require`) {
    try {
      return Object.keys(require(modulePath)).filter(
        exportName => exportName !== `__esModule`
      )
    } catch {
      return []
    }
  } else {
    return staticallyAnalyzeExports(modulePath, resolver)
  }
}
