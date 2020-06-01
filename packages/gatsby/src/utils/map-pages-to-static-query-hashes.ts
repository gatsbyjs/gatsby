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

  const getDeps = (mod): any => {
    const result = new Set()

    const getDepsFn = (mod): any => {
      for (const b of mod.blocks) {
        for (const x of b.dependencies) {
          if (x.module) {
            result.add(x.module.resource)
            if (x.module.dependencies) {
              getDepsFn(x.module)
            }
          }
        }
      }

      for (const d of mod.dependencies) {
        if (d.module) {
          result.add(d.module.resource)
          if (d.module.dependencies) {
            getDepsFn(d.module)
          }
        }
      }
      return result
    }

    return getDepsFn(mod)
  }

  const mapTemplatesToDependencies = Array.from(components).reduce(
    (map, [path, component]) => {
      const { componentPath } = component
      const mod = modules.find(module => module.resource === componentPath)

      if (!mod) {
        return map
      }

      const dependencies = getDeps(mod)

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
    const staticQueryHashes = new Set()

    {
      const staticQueryHash = mapOfComponentsToStaticQueryHashes.get(page)
      if (staticQueryHash) {
        staticQueryHashes.add(staticQueryHash)
      }
    }

    for (const d of dependencies) {
      const staticQueryHash = mapOfComponentsToStaticQueryHashes.get(d)
      if (staticQueryHash) {
        staticQueryHashes.add(staticQueryHash)
      }
    }

    map.set(page, Array.from(staticQueryHashes))
    return map
  }, new Map())

  return mapOfTemplatesToStaticQueryHashes
}
