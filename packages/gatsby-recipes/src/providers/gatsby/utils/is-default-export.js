import * as t from "@babel/types"

export default function isDefaultExport(node) {
  if (!node || !t.isMemberExpression(node)) {
    return false
  }

  const { object, property } = node

  if (!t.isIdentifier(object) || object.name !== `module`) return false
  if (!t.isIdentifier(property) || property.name !== `exports`) return false

  return true
}
