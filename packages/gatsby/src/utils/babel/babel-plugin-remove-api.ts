import { declare } from "@babel/helper-plugin-utils"
import * as t from "@babel/types"
import type { PluginObj, ConfigAPI } from "@babel/core"

export default declare(function removeApiCalls(
  api: ConfigAPI,
  options: { apis?: Array<string> }
): PluginObj {
  api.assertVersion(7)

  const apisToRemove = options?.apis ?? []

  if (!apisToRemove.length) {
    console.warn(
      `No list of APIs was given to remove, check your plugin options.`
    )
  }

  return {
    name: `remove-api`,
    visitor: {
      Program: {
        exit(path): void {
          // make sure all references are up to date
          path.scope.crawl()

          // remove all unreferenced bindings
          Object.keys(path.scope.bindings).forEach(refName => {
            const ref = path.scope.bindings[refName]
            if (!ref.referenced) {
              ref.path.remove()

              // if it's a module and all specifiers are removed, remove the full binding
              if (
                ref.kind === `module` &&
                !(ref.path.parent as t.ImportDeclaration).specifiers.length
              ) {
                ref.path.parentPath.remove()
              }
            }
          })
        },
      },

      ExportNamedDeclaration(path): void {
        const declaration = path.node.declaration

        if (t.isExportNamedDeclaration(path.node)) {
          const specifiersToKeep: Array<
            | t.ExportDefaultSpecifier
            | t.ExportNamespaceSpecifier
            | t.ExportSpecifier
          > = []
          path.node.specifiers.forEach(specifier => {
            if (
              t.isExportSpecifier(specifier) &&
              t.isIdentifier(specifier.exported) &&
              apisToRemove.includes(specifier.exported.name)
            ) {
              path.scope.bindings[specifier.local.name].path.remove()
            } else {
              specifiersToKeep.push(specifier)
            }
          })

          path.node.specifiers = specifiersToKeep
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

        if (apiToCheck && apisToRemove.includes(apiToCheck)) {
          path.remove()
        }
      },
    },
  }
})
