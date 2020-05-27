import { Stats, Module } from "webpack"

import { IGatsbyState } from "../redux/types"

type MapOfTemplatesToStaticQueryHashes = Map<string, Array<number>>

const findModule = (path, modules): Module | null => {
  for (const m of modules) {
    if (m.constructor.name === `ConcatenatedModule`) {
      const possibleMod = findModule(path, m.modules)
      if (possibleMod) {
        return possibleMod
      }
    } else if (m.constructor.name === `NormalModule` && m.resource === path) {
      return m
    }
  }
  return null
}

export function mapTemplatesToStaticQueryHashes(
  reduxState: IGatsbyState,
  webpackStats: Stats
): MapOfTemplatesToStaticQueryHashes {
  const { staticQueryComponents, components } = reduxState

  const modules = webpackStats.compilation.modules

  const getEntrypoints = (
    mod,
    entrypoints: Set<string> = new Set(),
    visitedModules = new Set()
  ): Set<string> => {
    if (visitedModules.has(mod.resource)) {
      return entrypoints
    }
    visitedModules.add(mod.resource)

    if (mod.constructor.name === `ConcatenatedModule`) {
      mod.modules.forEach(m2 => {
        getEntrypoints(m2, entrypoints, visitedModules)
      })
      return entrypoints
    }
    if (components.has(mod.resource)) {
      entrypoints.add(mod.resource)
      return entrypoints
    }

    if (mod && mod.reasons) {
      mod.reasons.forEach(reason => {
        if (reason.dependency.type === `single entry`) {
          entrypoints.add(reason.dependency.request)
        } else if (
          reason.dependency.type !== `harmony side effect evaluation` &&
          reason.dependency.type !== `harmony export imported specifier`
        ) {
          getEntrypoints(reason.module, entrypoints, visitedModules)
        }
      })
    }

    return entrypoints
  }

  const map = new Map()

  staticQueryComponents.forEach(({ componentPath, hash }) => {
    const staticQueryComponentModule = findModule(componentPath, modules)
    if (staticQueryComponentModule) {
      const entrypoints = getEntrypoints(staticQueryComponentModule)
      entrypoints.forEach(entrypoint => {
        const hashes = map.get(entrypoint) || []
        hashes.push(hash)
        map.set(entrypoint, hashes)
      })
    }
  })

  return map
}
