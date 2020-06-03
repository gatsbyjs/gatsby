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

  // const visitedModules = new Map()

  const getDeps = (mod): any => {
    const result = new Set()
    // let hits = 0

    const getDepsFn = (mod, depth, path: any[] = []): any => {
      // depth++

      // if (depth > 100) {
      //   debugger
      // }
      // if (visitedModules.has(mod.resource)) {
      //   console.log(`We have a cache hit`)
      //   hits++
      //   return visitedModules.get(mod.resource)
      // }
      for (const b of mod.blocks) {
        for (const x of b.dependencies) {
          if (x.module) {
            if (
              x.type === `harmony side effect evaluation` ||
              x.type === `harmony export imported specifier`
            ) {
              continue
            }
            result.add(x.module.resource)
            if (x.module.dependencies) {
              getDepsFn(x.module, depth, [...path, x])
            }
          }
        }
      }

      for (const d of mod.dependencies) {
        if (d.module) {
          if (
            d.type === `harmony side effect evaluation` ||
            d.type === `harmony export imported specifier`
          ) {
            continue
          }
          result.add(d.module.resource)
          if (d.module.dependencies) {
            getDepsFn(d.module, depth, [...path, d])
          }
        }
      }
      // visitedModules.set(mod.resource, result)
      return result
    }

    const depTree = getDepsFn(mod, 0)
    // console.log(hits)
    return depTree
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
