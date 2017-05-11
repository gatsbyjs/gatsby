import path from "path"

import * as types from "babel-types"
import { parse, defaultHandlers } from "react-docgen"
import { ERROR_MISSING_DEFINITION } from "react-docgen/dist/parse"
import findAllComponentDefinitions
  from "react-docgen/dist/resolver/findAllComponentDefinitions"

import { parseDoclets, applyPropDoclets } from "./Doclets"

function getAssignedIdenifier(path) {
  let property = path.parentPath
  while (property) {
    if (types.isVariableDeclarator(property.node)) return property.node.id.name
    property = property.parentPath
  }
}

let fileCount = 0
function nameHandler(filePath = `/AnonymousComponent_${++fileCount}`) {
  let defaultName = path.basename(filePath, path.extname(filePath))
  let componentCount = 0

  return (docs, nodePath) => {
    let displayName = docs.get(displayName)
    if (displayName) return

    if (
      types.isArrowFunctionExpression(nodePath.node) ||
      types.isFunctionExpression(nodePath.node) ||
      types.isObjectExpression(nodePath.node)
    ) {
      displayName = getAssignedIdenifier(nodePath)
    } else if (
      types.isFunctionDeclaration(nodePath.node) ||
      types.isClassDeclaration(nodePath.node)
    ) {
      displayName = nodePath.node.id.name
    }

    docs.set(`displayName`, displayName || `${defaultName}_${++componentCount}`)
  }
}

export default function parseMetadata(content, filePath, options) {
  let components = []
  options = options || {}
  try {
    components = parse(
      content,
      options.resolver || findAllComponentDefinitions,
      [...defaultHandlers, ...(options.handlers || []), nameHandler(filePath)]
    )
  } catch (err) {
    if (err.message === ERROR_MISSING_DEFINITION) return []
    throw err
  }

  if (components.length === 1) {
    components[0].displayName = components[0].displayName.replace(/_\d+$/, ``)
  }

  components.forEach(component => {
    parseDoclets(component)
    component.props = Object.keys(component.props || {}).map(propName => {
      const prop = component.props[propName]
      prop.name = propName
      parseDoclets(prop, propName)
      applyPropDoclets(prop)
      return prop
    })
  })

  return components
}
