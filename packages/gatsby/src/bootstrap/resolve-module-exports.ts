import fs from "fs"
import * as t from "@babel/types"
import traverse from "@babel/traverse"
import { codeFrameColumns, SourceLocation } from "@babel/code-frame"
import { babelParseToAst } from "../utils/babel-parse-to-ast"
import report from "gatsby-cli/lib/reporter"

import { testRequireError } from "../utils/test-require-error"

const staticallyAnalyzeExports = (
  modulePath: string,
  resolver = require.resolve
): Array<string> => {
  let absPath: string | undefined
  const exportNames: Array<string> = []

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
          start: (err as unknown as { loc: SourceLocation["start"] }).loc,
        },
        {
          highlightCode: true,
        }
      )

      report.panic(
        `Syntax error in "${absPath}":\n${err.message}\n${codeFrame}`
      )
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
    ImportDeclaration: function ImportDeclaration() {
      isES6 = true
    },

    ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
      const declaration = astPath.node.declaration

      // get foo from `export const foo = bar`
      if (
        declaration?.type === `VariableDeclaration` &&
        declaration.declarations[0]?.id.type === `Identifier`
      ) {
        isES6 = true
        exportNames.push(declaration.declarations[0].id.name)
      }

      // get foo from `export function foo()`
      if (
        declaration?.type === `FunctionDeclaration` &&
        declaration.id?.type === `Identifier`
      ) {
        isES6 = true
        exportNames.push(declaration.id.name)
      }
    },

    // get foo from `export { foo } from 'bar'`
    // get foo from `export { foo }`
    ExportSpecifier: function ExportSpecifier(astPath) {
      isES6 = true
      const exp = astPath?.node?.exported
      if (!exp) {
        return
      }
      if (exp.type === `Identifier`) {
        const exportName = exp.name
        if (exportName) {
          exportNames.push(exportName)
        }
      }
    },

    // export default () => {}
    // export default function() {}
    // export default function foo() {}
    // const foo = () => {}; export default foo
    ExportDefaultDeclaration: function ExportDefaultDeclaration(astPath) {
      const declaration = astPath.node.declaration
      if (
        !t.isIdentifier(declaration) &&
        !t.isArrowFunctionExpression(declaration) &&
        !t.isFunctionDeclaration(declaration)
      ) {
        return
      }

      let name = ``
      if (t.isIdentifier(declaration)) {
        name = declaration.name
      } else if (t.isFunctionDeclaration(declaration) && declaration.id) {
        name = declaration.id.name
      }

      const exportName = `export default${name ? ` ${name}` : ``}`
      isES6 = true
      exportNames.push(exportName)
    },

    AssignmentExpression: function AssignmentExpression(astPath) {
      const nodeLeft = astPath.node.left

      if (!t.isMemberExpression(nodeLeft)) {
        return
      }

      // ignore marker property `__esModule`
      if (
        t.isIdentifier(nodeLeft.property) &&
        nodeLeft.property.name === `__esModule`
      ) {
        return
      }

      // get foo from `exports.foo = bar`
      if (
        t.isIdentifier(nodeLeft.object) &&
        nodeLeft.object.name === `exports`
      ) {
        isCommonJS = true
        exportNames.push((nodeLeft.property as t.Identifier).name)
      }

      // get foo from `module.exports.foo = bar`
      if (t.isMemberExpression(nodeLeft.object)) {
        const exp: t.MemberExpression = nodeLeft.object

        if (
          t.isIdentifier(exp.object) &&
          t.isIdentifier(exp.property) &&
          exp.object.name === `module` &&
          exp.property.name === `exports`
        ) {
          isCommonJS = true
          exportNames.push((nodeLeft.property as t.Identifier).name)
        }
      }
    },
  })

  if (isES6 && isCommonJS && process.env.NODE_ENV !== `test`) {
    report.panic(
      `This plugin file is using both CommonJS and ES6 module systems together which we don't support.
You'll need to edit the file to use just one or the other.

plugin: ${modulePath}.js

This didn't cause a problem in Gatsby v1 so you might want to review the migration doc for this:
https://gatsby.dev/no-mixed-modules
      `
    )
  }
  return exportNames
}

/**
 * Given a `require.resolve()` compatible path pointing to a JS module,
 * return an array listing the names of the module's exports.
 *
 * Returns [] for invalid paths and modules without exports.
 *
 * @param modulePath
 * @param mode
 * @param resolver
 */
export const resolveModuleExports = (
  modulePath: string,
  { mode = `analysis`, resolver = require.resolve } = {}
): Array<string> => {
  if (mode === `require`) {
    let absPath: string | undefined
    try {
      absPath = resolver(modulePath)
      return Object.keys(require(modulePath)).filter(
        exportName => exportName !== `__esModule`
      )
    } catch (e) {
      if (!testRequireError(modulePath, e)) {
        // if module exists, but requiring it cause errors,
        // show the error to the user and terminate build
        report.panic(`Error in "${absPath}":`, e)
      }
    }
  } else {
    return staticallyAnalyzeExports(modulePath, resolver)
  }

  return []
}
