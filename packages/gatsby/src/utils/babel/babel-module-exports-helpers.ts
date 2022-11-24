import { ExportNamedDeclaration, ObjectPattern } from "@babel/types"
import { NodePath } from "@babel/core"

/**
 * Check the node has at least one sibling.
 */
export function hasSibling(path: NodePath): boolean {
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
 * Matches exports like these:
 * ```
 * export const { foo } = {} // or `let`/`var`
 * export const { foo, bar: baz } = {} // or `let`/`var`
 * ```
 *
 * This is cheaper than using a nested visitor and traversing upwards to check distance
 * from the export declaration.
 */
export function removeExportProperties(
  exportPath: NodePath<ExportNamedDeclaration>,
  objectPath: NodePath<ObjectPattern>,
  propertiesToRemove: Array<string>
): void {
  for (let i = 0; i < objectPath.node.properties.length; i++) {
    const property = objectPath.node.properties[i]

    if (
      property.type !== `ObjectProperty` ||
      property.value.type !== `Identifier` ||
      !propertiesToRemove.includes(property.value.name)
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

    if (!exportPath.removed) {
      exportPath.remove()
    }
  }
}
