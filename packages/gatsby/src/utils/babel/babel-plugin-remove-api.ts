import { declare } from "@babel/helper-plugin-utils"
import * as t from "@babel/types"
import type { PluginObj, ConfigAPI, NodePath } from "@babel/core"
import { removeExportProperties } from "./babel-module-exports-helpers"

/**
 * Remove specified module exports from files.
 */
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
        exit(path, state): void {
          if (!state.apiRemoved) {
            return
          }

          // babel doesn't remove references very well so we loop until nothing gets removed
          let removed = false

          // remove all unreferenced bindings
          do {
            removed = false
            // make sure all references are up to date
            path.scope.crawl()

            Object.keys(path.scope.bindings).forEach(refName => {
              const ref = path.scope.bindings[refName]

              if (ref.referenced) {
                // Functions can reference themselves, so we need to check if there's a
                // binding outside the function scope or not.
                if (ref.path.type === `FunctionDeclaration`) {
                  const isSelfReferenced = ref.referencePaths.every(
                    refPath => !!refPath.findParent(p => p === ref.path)
                  )

                  if (isSelfReferenced) {
                    ref.path.remove()
                    removed = true
                  }
                }
              } else {
                // if const {x,y} is used, we remove the property
                if (
                  t.isVariableDeclarator(ref.path) &&
                  t.isObjectPattern(
                    (ref.path.parent as t.VariableDeclaration).declarations[0]
                      .id
                  )
                ) {
                  const objectPattern = (
                    ref.path.parent as t.VariableDeclaration
                  ).declarations[0].id as t.ObjectPattern
                  objectPattern.properties = objectPattern.properties.filter(
                    prop =>
                      t.isObjectProperty(prop)
                        ? (prop.value as t.Identifier).name !== refName
                        : ((prop as t.RestElement).argument as t.Identifier)
                            .name !== refName
                  )

                  // if all properties got removed thus the object pattern is empty, we remove the whole declaration
                  if (!objectPattern.properties.length) {
                    ref.path.remove()
                  }
                } else {
                  ref.path.remove()
                }

                // if it's a module and all specifiers are removed, remove the full binding
                if (
                  ref.kind === `module` &&
                  !(ref.path.parent as t.ImportDeclaration).specifiers.length &&
                  ref.path.parentPath
                ) {
                  ref.path.parentPath.remove()
                }

                removed = true
              }
            })
          } while (removed)
        },
      },

      // Remove export statements

      ExportDefaultDeclaration(path, state): void {
        if (apisToRemove.includes(`default`)) {
          state.apiRemoved = true
          path.remove()
        }
      },
      ExportNamedDeclaration(path, state): void {
        const declaration = path.node.declaration

        if (t.isExportNamedDeclaration(path.node)) {
          const specifiersToKeep: Array<
            | t.ExportDefaultSpecifier
            | t.ExportNamespaceSpecifier
            | t.ExportSpecifier
          > = []

          // Remove `export { foo } = [...]` and `export { foo } from "X"` shaped exports
          path.node.specifiers.forEach(specifier => {
            if (
              t.isExportSpecifier(specifier) &&
              t.isIdentifier(specifier.exported) &&
              apisToRemove.includes(specifier.exported.name)
            ) {
              const binding = path.scope.bindings[specifier.local.name]
              // binding will not exist for `export { foo } from "X"` cases
              if (binding) {
                binding.path.remove()
              }
            } else {
              specifiersToKeep.push(specifier)
            }
          })

          path.node.specifiers = specifiersToKeep
        }

        // Remove `export function foo() {}` shaped exports
        let apiToCheck
        if (t.isFunctionDeclaration(declaration) && declaration.id) {
          apiToCheck = declaration.id.name
        }

        // Remove `export const foo = () => {}` shaped exports
        if (
          t.isVariableDeclaration(declaration) &&
          t.isIdentifier(declaration.declarations[0].id)
        ) {
          apiToCheck = declaration.declarations[0].id.name
        }

        if (apiToCheck && apisToRemove.includes(apiToCheck)) {
          state.apiRemoved = true
          path.remove()
        }

        // Remove `export const { foo } = () => {}` shaped exports
        if (t.isVariableDeclaration(declaration)) {
          for (let i = 0; i < declaration?.declarations.length; i++) {
            if (declaration?.declarations[i].id.type === `ObjectPattern`) {
              const objectPath = path.get(
                `declaration.declarations.${i}.id`
              ) as NodePath<t.ObjectPattern>
              removeExportProperties(path, objectPath, apisToRemove)
            }
          }
        }
        // Remove `export const { foo } from "X"` shaped exports
        else if (path.node?.source) {
          if (path.node.specifiers.length === 0) {
            path.remove()
          }
        }
      },

      // Remove `module.exports = { foo }` and `exports.foo = {}` shaped exports
      ExpressionStatement(path, state): void {
        if (
          !t.isAssignmentExpression(path.node.expression) ||
          !t.isMemberExpression(path.node.expression.left) ||
          (path.node.expression.left.object as t.Identifier).name !== `exports`
        ) {
          return
        }

        const apiToCheck = (path.node.expression.left.property as t.Identifier)
          .name
        if (apiToCheck && apisToRemove.includes(apiToCheck)) {
          state.apiRemoved = true
          path.remove()
        }
      },
    },
  }
})
