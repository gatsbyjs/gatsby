import { uniq } from "lodash"

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

  const mapTemplatesToDependencies = Array.from(components).reduce(
    (map, [path, component]) => {
      const { componentPath } = component
      const module = modules.find(module => module.resource === componentPath)

      if (!module) {
        return map
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
        .map(dependency =>
          // console.log(dependency)
          mapOfComponentsToStaticQueryHashes.get(dependency)
        )
        .filter(Boolean)
    )
    return map
  }, new Map())

  return mapOfTemplatesToStaticQueryHashes
}
