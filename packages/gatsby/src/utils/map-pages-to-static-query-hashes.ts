import { uniq } from "lodash"
import { Stats } from "webpack"

import { IGatsbyState } from "../redux/types"

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

  const mapComponentsToStaticQueryHashes = Array.from(
    staticQueryComponents
  ).reduce((map, [, { componentPath, hash }]) => {
    map.set(componentPath, hash)
    return map
  }, new Map())

  const mapPagesToStaticQueryHashes = Array.from(mapPagesToDependencies).reduce(
    (map, [page, { dependencies }]) => {
      map.set(
        page,
        dependencies
          .map(dependency => mapComponentsToStaticQueryHashes.get(dependency))
          .filter(Boolean)
      )
      return map
    },
    new Map()
  )

  return mapPagesToStaticQueryHashes
}
