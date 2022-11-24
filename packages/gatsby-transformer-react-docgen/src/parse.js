import { handlers, parse, resolver } from "react-docgen"
import { ERROR_MISSING_DEFINITION } from "react-docgen/dist/parse"
import { codeFrameColumns } from "@babel/code-frame"
import { createDisplayNameHandler } from "./displayname-handler"
import { applyPropDoclets, cleanDoclets, parseDoclets } from "./doclets"

const defaultHandlers = [
  handlers.propTypeHandler,
  handlers.propTypeCompositionHandler,
  handlers.propDocBlockHandler,
  handlers.flowTypeHandler,
  handlers.defaultPropsHandler,
  handlers.componentDocblockHandler,
  handlers.componentMethodsHandler,
  handlers.componentMethodsJsDocHandler,
]

let fileCount = 0

/**
 * Wrap handlers to pass in additional arguments such as the File node
 */
function makeHandlers(node, handlers) {
  handlers = (handlers || []).map(
    h =>
      (...args) =>
        h(...args, node)
  )
  return [
    createDisplayNameHandler(
      node.absolutePath || `/UnknownComponent${++fileCount}`
    ),
    ...handlers,
  ]
}

export default function parseMetadata(content, node, options) {
  let components = []
  const { handlers, resolver: userResolver, ...parseOptions } = options || {}
  try {
    components = parse(
      content,
      userResolver || resolver.findAllComponentDefinitions,
      makeHandlers(node, handlers).concat(defaultHandlers),
      {
        ...parseOptions,
        filename: node.absolutePath,
      }
    )
  } catch (err) {
    if (err.message === ERROR_MISSING_DEFINITION) return []
    // reset the stack to here since it's not helpful to see all the react-docgen guts
    // const parseErr = new Error(err.message)
    if (err.loc) {
      err.codeFrame = codeFrameColumns(
        content,
        err.loc.start || { start: err.loc },
        {
          highlightCode: true,
        }
      )
    }
    throw err
  }

  if (components.length === 1) {
    components[0].displayName = components[0].displayName.replace(/\d+$/, ``)
  }

  components.forEach(component => {
    component.docblock = component.description || ``
    component.doclets = parseDoclets(component)
    component.description = cleanDoclets(component.description)

    component.props = Object.keys(component.props || {}).map(propName => {
      const prop = component.props[propName]
      prop.name = propName
      prop.docblock = prop.description || ``
      prop.doclets = parseDoclets(prop, propName)
      prop.description = cleanDoclets(prop.description)

      applyPropDoclets(prop)
      return prop
    })
  })

  return components
}
