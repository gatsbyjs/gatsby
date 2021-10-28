import { declare } from "@babel/helper-plugin-utils"
import * as t from "@babel/types"
import type { PluginObj, ConfigAPI } from "@babel/core"

// Partially copied from https://github.com/babel/minify/blob/1ad7838116ec34621d39bb1b4a985e7601eab659/packages/babel-plugin-transform-inline-environment-variables/src/index.js

export default declare(function replaceEnvVars(
  api: ConfigAPI,
  options: { apis?: Array<string> }
): PluginObj {
  api.assertVersion(7)

  const apisToInclude = options?.apis ?? []

  if (!apisToInclude.length) {
    console.warn(
      `No list of APIs was given to replace env vars, check your plugin options.`
    )
  }

  function isLeftSideOfAssignmentExpression(path): boolean {
    return (
      t.isAssignmentExpression(path.parent) && path.parent.left === path.node
    )
  }

  function replacement(path): void {
    if (path.get(`object`).matchesPattern(`process.env`)) {
      const key = path.toComputedKey()
      if (t.isStringLiteral(key) && !isLeftSideOfAssignmentExpression(path)) {
        path.replaceWith(t.valueToNode(process.env[key.value]))
      }
    }
  }

  return {
    name: `ssr-env-vars`,
    visitor: {
      ExportNamedDeclaration(path): void {
        const declaration = path.node.declaration

        if (t.isExportNamedDeclaration(path.node)) {
          const hasExport = path.node.specifiers.some(
            specifier =>
              t.isExportSpecifier(specifier) &&
              t.isIdentifier(specifier.exported) &&
              apisToInclude.includes(specifier.exported.name)
          )
          if (hasExport) {
            path.traverse({
              MemberExpression(path) {
                replacement(path)
              },
            })
          }
        }

        let apiToCheck
        if (t.isFunctionDeclaration(declaration) && declaration.id) {
          apiToCheck = declaration.id.name
        }

        if (
          t.isVariableDeclaration(declaration) &&
          t.isIdentifier(declaration.declarations[0].id)
        ) {
          apiToCheck = declaration.declarations[0].id.name
        }

        if (apiToCheck && apisToInclude.includes(apiToCheck)) {
          path.traverse({
            MemberExpression(path) {
              replacement(path)
            },
          })
        }
      },
    },
  }
})
