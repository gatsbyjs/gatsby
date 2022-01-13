import { ExportNamedDeclaration } from "@babel/types"
import { Visitor, NodePath } from "@babel/core"

/**
 * Check the node has at least one sibling.
 */
function hasSibling(path: NodePath): boolean {
  return (
    [...path.getAllPrevSiblings(), ...path.getAllNextSiblings()].length !== 0
  )
}

/**
 * Remove specific properties from a destructured variable named export.
 *
 * If there are no other properties or declarations, the entire export declaration will be removed.
 * If there are other properties, only the matching properties will be removed.
 *
 * @example
 * To remove exports like these:
 * ```
 * export const { foo } = {} // or `let`/`var`
 * export const { foo, bar: baz } = {} // or `let`/`var`
 * ```
 *
 * traverse inside an `ExportNamedDeclaration` node:
 * ```
 * ExportNamedDeclaration(path, state): void {
 *  path.traverse(RemoveNamedExportVisitor, {
 *    path,
 *    propertiesToRemove: [`foo`, `baz`]
 *  })
 * }
 * ```
 */
const RemoveNamedExportPropertiesVisitor: Visitor<{
  path: NodePath<ExportNamedDeclaration>
  propertiesToRemove: Array<string>
}> = {
  ObjectPattern(objectPath) {
    for (let i = 0; i < objectPath.node.properties.length; i++) {
      const property = objectPath.node.properties[i]

      if (
        property.type !== `ObjectProperty` ||
        property.value.type !== `Identifier` ||
        !this.propertiesToRemove.includes(property.value.name)
      ) {
        continue
      }

      const propertyPath = objectPath.get(`properties.${i}`) as NodePath

      if (hasSibling(propertyPath) && !propertyPath.removed) {
        propertyPath.remove()
        continue
      }

      if (hasSibling(objectPath.parentPath) && !objectPath.parentPath.removed) {
        objectPath.parentPath.remove()
        break
      }

      if (!this.path.removed) {
        this.path.remove()
      }
    }
  },
}

export { RemoveNamedExportPropertiesVisitor }
