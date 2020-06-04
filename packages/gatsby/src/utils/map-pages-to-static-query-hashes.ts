import { uniqBy } from "lodash"
import { IGatsbyState } from "../redux/types"

const mapComponentsToStaticQueryHashes = (
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
): Map<string, string> =>
  Array.from(staticQueryComponents).reduce(
    (map, [, { componentPath, hash }]) => {
      map.set(componentPath, hash)
      return map
    },
    new Map()
  )

export function mapTemplatesToStaticQueryHashes(
  reduxState: IGatsbyState,
  compilation
): Map<string, Array<number>> {
  const { components, staticQueryComponents } = reduxState
  const { modules } = compilation

  const terminalNodes = [
    `.cache/api-runner-browser-plugins.js`,
    `.cache/async-requires.js`,
  ]

  const globalStaticQueries = new Set()

  const getDeps = (mod): any => {
    const staticQueryModuleComponentPath = mod.resource
    const result = new Set()

    const getDepsFn = (m): any => {
      const hasReasons = m.hasReasons()
      const isTerminalNode = terminalNodes.reduce(
        (result, terminalNode) => result || m.resource.includes(terminalNode),
        false
      )

      // Exit if we don't have any reasons or we have reached a possible terminal node
      if (!hasReasons || isTerminalNode) {
        return result
      }

      const nonTerminalDependents = m.reasons
        .filter(r => {
          const dependentModule = r.module
          const isTerminal = terminalNodes.reduce(
            (result, terminalNode) =>
              result || dependentModule.resource.includes(terminalNode),
            false
          )
          return !isTerminal
        })
        .map(r => r.module)

      const uniqDependents = uniqBy(nonTerminalDependents, d => d.identifier())

      for (const x of uniqDependents) {
        result.add(x.resource)

        if (x.resource.includes(`gatsby-browser.js`)) {
          globalStaticQueries.add(staticQueryModuleComponentPath)
        }
        getDepsFn(x)
      }

      return result
    }

    return getDepsFn(mod)
  }

  const mapOfStaticQueryComponentsToDependants = new Map()

  staticQueryComponents.forEach(({ componentPath }) => {
    const staticQueryComponentModule = modules.find(
      m => m.resource === componentPath
    )

    const dependants = staticQueryComponentModule
      ? getDeps(staticQueryComponentModule)
      : new Set()

    mapOfStaticQueryComponentsToDependants.set(componentPath, dependants)
  })

  const mapOfComponentsToStaticQueryHashes = mapComponentsToStaticQueryHashes(
    staticQueryComponents
  )

  const globalStaticQueryHashes = []

  globalStaticQueries.forEach(q =>
    globalStaticQueryHashes.push(mapOfComponentsToStaticQueryHashes.get(q))
  )

  const mapOfTemplatesToStaticQueryHashes = Array.from(components).reduce(
    (map, [page]) => {
      const staticQueryHashes = [...globalStaticQueryHashes]

      // Does this page contain an inline static query?
      if (mapOfComponentsToStaticQueryHashes.has(page)) {
        staticQueryHashes.push(mapOfComponentsToStaticQueryHashes.get(page))
      }

      // Check dependencies
      mapOfStaticQueryComponentsToDependants.forEach(
        (setOfDependants, staticQueryComponentPath) => {
          if (setOfDependants.has(page)) {
            staticQueryHashes.push(
              mapOfComponentsToStaticQueryHashes.get(staticQueryComponentPath)
            )
          }
        }
      )
      map.set(page, staticQueryHashes)
      return map
    },
    new Map()
  )

  return mapOfTemplatesToStaticQueryHashes
}
