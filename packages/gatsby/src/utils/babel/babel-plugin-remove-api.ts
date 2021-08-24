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
      ExportNamedDeclaration(path): void {
        const declaration = path.node.declaration

        if (!path.node.declaration) {
          const specifiersToKeep = []
          path.node.specifiers.forEach(specifier => {
            if (apisToRemove.includes(specifier.exported.name)) {
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
