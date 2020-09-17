import {
  JSXAttribute,
  JSXIdentifier,
  JSXNamespacedName,
  JSXOpeningElement,
} from "@babel/types"
import { NodePath } from "@babel/core"

export function parseIdentifier(
  identifier: JSXIdentifier | JSXNamespacedName
): string {
  if (identifier.type === `JSXIdentifier`) {
    return identifier.name
  }
  return parseIdentifier(identifier.name)
}

export function evaluateAttributes(
  nodePath: NodePath<JSXOpeningElement>,
  onError?: (prop: string) => void,
  include?: Set<string>
): Record<string, any> {
  let result = {}

  nodePath.traverse({
    JSXSpreadAttribute(attrPath) {
      const spreadValues = attrPath.get(`argument`).evaluate()
      if (spreadValues.confident) {
        result = { ...result, ...spreadValues.value }
      } else {
        // eslint-disable-next-line no-unused-expressions
        onError?.(`<spread attributes>`)
      }
    },
    JSXAttribute(attrPath) {
      const prop = parseIdentifier(attrPath.node.name)
      if (include && !include.has(prop)) {
        return
      }
      const { value, confident } = evaluateAttributeValue(attrPath)
      if (confident) {
        result[prop] = value
      } else {
        // eslint-disable-next-line no-unused-expressions
        onError?.(prop)
      }
    },
  })

  return result
}

export function evaluateAttributeValue(
  nodePath: NodePath<JSXAttribute>
): {
  confident: boolean
  value: unknown
} {
  const valueNode = nodePath.get(`value`)
  if (!valueNode.node) {
    // empty attributes are truthy
    return { confident: true, value: true }
  } else if (valueNode.node.type === `JSXExpressionContainer`) {
    const expression = valueNode.get(`expression`)

    if (Array.isArray(expression)) {
      return expression[0]?.evaluate()
    }

    return expression.evaluate()
  } else {
    return valueNode.evaluate()
  }
}
