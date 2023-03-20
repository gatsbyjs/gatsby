// @ts-check
import { codeFrameColumns } from "@babel/code-frame"
import { createDisplayNameHandler } from "./displayname-handler"
import { applyPropDoclets, cleanDoclets, parseDoclets } from "./doclets"

let reactDocgen = null
let defaultHandlers = null
let fileCount = 0

/**
 * Wrap handlers to pass in additional arguments such as the File node
 */
function makeHandlers(node, handlers, utils) {
  handlers = (handlers || []).map(
    h =>
      (...args) =>
        h(...args, node)
  )
  return [
    createDisplayNameHandler(
      node.absolutePath || `/UnknownComponent${++fileCount}`,
      utils
    ),
    ...handlers,
  ]
}

export default async function parseMetadata(content, node, options) {
  if (!reactDocgen) {
    reactDocgen = await import(`react-docgen`)
    defaultHandlers = [
      reactDocgen.builtinHandlers.propTypeHandler,
      reactDocgen.builtinHandlers.propTypeCompositionHandler,
      reactDocgen.builtinHandlers.propDocBlockHandler,
      reactDocgen.builtinHandlers.codeTypeHandler,
      reactDocgen.builtinHandlers.defaultPropsHandler,
      reactDocgen.builtinHandlers.componentDocblockHandler,
      reactDocgen.builtinHandlers.componentMethodsHandler,
      reactDocgen.builtinHandlers.componentMethodsJsDocHandler,
    ]
  }
  const { parse, ERROR_CODES, FindAllDefinitionsResolver } = reactDocgen
  let components = []
  const { handlers, resolver: userResolver, ...parseOptions } = options || {}
  try {
    components = await parse(content, {
      resolver: userResolver || FindAllDefinitionsResolver,
      handlers: makeHandlers(node, handlers, reactDocgen.utils).concat(
        defaultHandlers
      ),
      filename: node.absolutePath,
      ...parseOptions,
    })
  } catch (err) {
    if (err.code === ERROR_CODES.MISSING_DEFINITION) return []
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
