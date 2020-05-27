import { uniq } from "lodash"
import { Stats } from "webpack"

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

export function mapPagesToStaticQueryHashes(
  reduxState: IGatsbyState,
  webpackStats: Stats
): Map<string, Array<number>> {
  const { pages, staticQueryComponents } = reduxState
  const modules = webpackStats.compilation.modules
  const mapPagesToDependencies = Array.from(pages).reduce(
    (map, [path, page]) => {
      const { component } = page
      const module = modules.find(module => module.resource === component)
      const dependencies = uniq(
        module.dependencies.filter(m => m.module).map(m => m.module.resource)
      )
      map.set(path, {
        component,
        dependencies,
      })
      return map
    },
    new Map()
  )

  const mapOfComponentsToStaticQueryHashes = mapComponentsToStaticQueryHashes(
    staticQueryComponents
  )

  const mapPagesToStaticQueryHashes = Array.from(mapPagesToDependencies).reduce(
    (map, [page, { dependencies }]) => {
      map.set(
        page,
        dependencies
          .map(dependency => mapOfComponentsToStaticQueryHashes.get(dependency))
          .filter(Boolean)
      )
      return map
    },
    new Map()
  )

  return mapPagesToStaticQueryHashes
}

export function mapTemplatesToStaticQueryHashes(
  reduxState: IGatsbyState,
  webpackStats: Stats
): Map<string, Array<number>> {
  const { components, staticQueryComponents } = reduxState
  const modules = webpackStats.compilation.modules
  const mapTemplatesToDependencies = Array.from(components).reduce(
    (map, [path, component]) => {
      const { componentPath } = component
      const module = modules.find(module => module.resource === componentPath)
      if (!module) {
        // ConcatanatedModule :sob:
        map.set(path, {
          component,
          dependencies: [],
        })
        return map
        // debugger
        // console.log({
        //   component,
        //   modules
        // })
      }
      const dependencies = uniq(
        module.dependencies.filter(m => m.module).map(m => m.module.resource)
      )
      map.set(path, {
        component,
        dependencies,
      })
      return map
    },
    new Map()
  )

  const mapOfComponentsToStaticQueryHashes = mapComponentsToStaticQueryHashes(
    staticQueryComponents
  )

  const mapOfTemplatesToStaticQueryHashes = Array.from(
    mapTemplatesToDependencies
  ).reduce((map, [page, { dependencies }]) => {
    map.set(
      page,
      dependencies
        .map(dependency => mapOfComponentsToStaticQueryHashes.get(dependency))
        .filter(Boolean)
    )
    return map
  }, new Map())

  return mapOfTemplatesToStaticQueryHashes
}
