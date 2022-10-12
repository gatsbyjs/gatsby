import path from "path"
import { Store } from "redux"
import { Compiler, Module, NormalModule, Compilation } from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
import { isEqual, cloneDeep } from "lodash"
import { generateComponentChunkName } from "../../js-chunk-names"
import { enqueueFlush } from "../../page-data"
import type {
  IGatsbyState,
  IGatsbyPageComponent,
  IGatsbyStaticQueryComponents,
} from "../../../redux/types"
import {
  ICollectedSlice,
  mergePreviouslyCollectedSlices,
} from "../../babel/find-slices"

type ChunkGroup = Compilation["chunkGroups"][0]
type EntryPoint = Compilation["asyncEntrypoints"][0]

/**
 * Remove the export query param from a path that can
 * a) contain only the ?export= query param
 * b) but also contain ?__contentFilePath&export=
 */
export const removeExportQueryParam = (
  path: string | undefined
): string | undefined => {
  if (!path?.includes(`?`)) {
    return path
  }
  const [filePath, queryParams] = path?.split(`?`)
  const params = new URLSearchParams(queryParams)
  params.delete(`export`)

  const paramsString = params.toString()

  return `${filePath}${
    paramsString ? `?${decodeURIComponent(paramsString)}` : ``
  }`
}

/**
 * Checks if a module matches a resourcePath
 */
function doesModuleMatchResourcePath(
  resourcePath: string,
  webpackModule: Module | NormalModule | ConcatenatedModule
): boolean {
  if (!(webpackModule instanceof ConcatenatedModule)) {
    return (
      removeExportQueryParam((webpackModule as NormalModule).resource) ===
      resourcePath
    )
  }

  // ConcatenatedModule is a collection of modules so we have to go deeper to actually get it
  return webpackModule.modules.some(
    innerModule =>
      removeExportQueryParam((innerModule as NormalModule).resource) ===
      resourcePath
  )
}

/**
 * A helper to set/get path resolving
 */
function getRealPath(
  cache: Map<string, string>,
  componentPath: string
): string {
  if (!cache.has(componentPath)) {
    cache.set(componentPath, path.resolve(componentPath))
  }

  return cache.get(componentPath) as string
}

/**
 * Grab the actual webpackModule from the resourcePath
 * We return staticQueries and componentPaths cause that's what we care about
 */
function getWebpackModulesByResourcePaths(
  modules: Set<Module>,
  staticQueries: IGatsbyState["staticQueryComponents"],
  components: IGatsbyState["components"],
  componentsUsingSlices: IGatsbyState["componentsUsingSlices"]
): {
  webpackModulesByStaticQueryId: Map<string, Set<Module>>
  webpackModulesByComponentId: Map<string, Set<Module>>
  webpackModulesUsingSlices: Set<{
    module: Module
    slices: Record<string, ICollectedSlice>
  }>
} {
  const realPathCache = new Map<string, string>()
  const webpackModulesByStaticQueryId = new Map<string, Set<Module>>()
  const webpackModulesByComponentId = new Map<string, Set<Module>>()
  const webpackModulesUsingSlices = new Set<{
    module: Module
    slices: Record<string, ICollectedSlice>
  }>()

  modules.forEach(webpackModule => {
    for (const [id, staticQuery] of staticQueries) {
      const staticQueryComponentPath = getRealPath(
        realPathCache,
        staticQuery.componentPath
      )

      if (
        !doesModuleMatchResourcePath(staticQueryComponentPath, webpackModule)
      ) {
        continue
      }

      let set = webpackModulesByStaticQueryId.get(id)

      if (!set) {
        set = new Set()
      }

      set.add(webpackModule)

      webpackModulesByStaticQueryId.set(id, set)
    }

    for (const [id, component] of components) {
      const componentComponentPath = getRealPath(
        realPathCache,
        component.componentPath
      )
      if (!doesModuleMatchResourcePath(componentComponentPath, webpackModule)) {
        continue
      }

      let set = webpackModulesByComponentId.get(id)

      if (!set) {
        set = new Set()
      }

      set.add(webpackModule)

      webpackModulesByComponentId.set(id, set)
    }

    for (const [filePath, slices] of componentsUsingSlices) {
      const componentComponentPath = getRealPath(realPathCache, filePath)
      if (!doesModuleMatchResourcePath(componentComponentPath, webpackModule)) {
        continue
      }

      webpackModulesUsingSlices.add({
        module: webpackModule,
        slices: slices,
      })
    }
  })

  return {
    webpackModulesByStaticQueryId,
    webpackModulesByComponentId,
    webpackModulesUsingSlices,
  }
}

/**
 * Chunks can be async so the group might not represent a pageComponent group
 * We'll need to search for it.
 */
function getChunkGroupsDerivedFromEntrypoint(
  chunkGroup: ChunkGroup,
  entrypoint: EntryPoint
): Array<ChunkGroup> {
  // when it's imported by any globals or async-requires we know we have the correct chunkgroups.
  // Async modules won't have hasParent listed
  if (chunkGroup.hasParent(entrypoint)) {
    return [chunkGroup]
  }

  let chunkGroups: Array<ChunkGroup> = []
  for (const parentChunkGroup of chunkGroup.getParents()) {
    const newChunkGroup = getChunkGroupsDerivedFromEntrypoint(
      parentChunkGroup,
      entrypoint
    )
    chunkGroups = chunkGroups.concat(newChunkGroup)
  }

  return chunkGroups
}

export class StaticQueryMapper {
  private store: Store<IGatsbyState>
  private name: string

  constructor(store) {
    this.store = store
    this.name = `StaticQueryMapper`
  }

  apply(compiler: Compiler): void {
    const { components, staticQueryComponents, componentsUsingSlices } =
      this.store.getState()

    compiler.hooks.done.tap(this.name, stats => {
      const compilation = stats.compilation
      // We only care about the main compilation
      // Chunkgraph should always be available when it's done but you know typescript.
      if (compilation.compiler.parentCompilation || !compilation.chunkGraph) {
        return
      }

      const staticQueriesByChunkGroup = new Map<ChunkGroup, Array<string>>()
      const pageSliceUsageByChunkGroup = new Map<
        ChunkGroup,
        Record<string, ICollectedSlice>
      >()
      const chunkGroupsWithPageComponents = new Set<ChunkGroup>()
      const chunkGroupsByComponentPath = new Map<
        IGatsbyPageComponent["componentPath"],
        ChunkGroup
      >()

      const {
        webpackModulesByStaticQueryId,
        webpackModulesByComponentId,
        webpackModulesUsingSlices,
      } = getWebpackModulesByResourcePaths(
        compilation.modules,
        staticQueryComponents,
        components,
        componentsUsingSlices
      )

      const appEntryPoint = (
        compilation.entrypoints.has(`app`)
          ? compilation.entrypoints.get(`app`)
          : compilation.entrypoints.get(`commons`)
      ) as EntryPoint

      // group hashes by chunkGroup for ease of use
      for (const [
        staticQueryId,
        webpackModules,
      ] of webpackModulesByStaticQueryId) {
        let chunkGroupsDerivedFromEntrypoints: Array<ChunkGroup> = []

        for (const webpackModule of webpackModules) {
          for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
            webpackModule
          )) {
            for (const chunkGroup of chunk.groupsIterable) {
              if (chunkGroup === appEntryPoint) {
                chunkGroupsDerivedFromEntrypoints.push(chunkGroup)
              } else {
                chunkGroupsDerivedFromEntrypoints =
                  chunkGroupsDerivedFromEntrypoints.concat(
                    getChunkGroupsDerivedFromEntrypoint(
                      chunkGroup,
                      appEntryPoint
                    )
                  )
              }
            }
          }
        }

        // loop over all component chunkGroups or global ones
        chunkGroupsDerivedFromEntrypoints.forEach(chunkGroup => {
          const staticQueryHashes =
            staticQueriesByChunkGroup.get(chunkGroup) ?? []

          staticQueryHashes.push(
            (
              staticQueryComponents.get(
                staticQueryId
              ) as IGatsbyStaticQueryComponents
            ).hash
          )

          staticQueriesByChunkGroup.set(chunkGroup, staticQueryHashes)
        })
      }

      // group Slice usage by chunkGroup for ease of use
      for (const {
        slices,
        module: webpackModule,
      } of webpackModulesUsingSlices) {
        let chunkGroupsDerivedFromEntrypoints: Array<ChunkGroup> = []
        for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
          webpackModule
        )) {
          for (const chunkGroup of chunk.groupsIterable) {
            if (chunkGroup === appEntryPoint) {
              chunkGroupsDerivedFromEntrypoints.push(chunkGroup)
            } else {
              chunkGroupsDerivedFromEntrypoints =
                chunkGroupsDerivedFromEntrypoints.concat(
                  getChunkGroupsDerivedFromEntrypoint(chunkGroup, appEntryPoint)
                )
            }
          }
        }

        // loop over all component chunkGroups or global ones
        chunkGroupsDerivedFromEntrypoints.forEach(chunkGroup => {
          pageSliceUsageByChunkGroup.set(
            chunkGroup,
            mergePreviouslyCollectedSlices(
              slices,
              pageSliceUsageByChunkGroup.get(chunkGroup)
            )
          )
        })
      }

      // group chunkGroups by componentPaths for ease of use
      for (const [
        componentPath,
        webpackModules,
      ] of webpackModulesByComponentId) {
        for (const webpackModule of webpackModules) {
          for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
            webpackModule
          )) {
            for (const chunkGroup of chunk.groupsIterable) {
              // When it's a direct import from app entrypoint (async-requires) we know we have the correct chunkGroup
              if (
                chunkGroup.name === generateComponentChunkName(componentPath)
              ) {
                chunkGroupsWithPageComponents.add(chunkGroup)
                chunkGroupsByComponentPath.set(componentPath, chunkGroup)
              }
            }
          }
        }
      }

      let globalStaticQueries: Array<string> = []
      for (const [chunkGroup, staticQueryHashes] of staticQueriesByChunkGroup) {
        // When a chunkgroup is not part of a pageComponent we know it's part of a global group.
        if (!chunkGroupsWithPageComponents.has(chunkGroup)) {
          globalStaticQueries = globalStaticQueries.concat(staticQueryHashes)
        }
      }

      let globalSliceUsage: Record<string, ICollectedSlice> = {}
      for (const [chunkGroup, slices] of pageSliceUsageByChunkGroup) {
        if (
          !chunkGroupsWithPageComponents.has(chunkGroup) &&
          !chunkGroup.name?.endsWith(`head`)
        ) {
          globalSliceUsage = mergePreviouslyCollectedSlices(
            slices,
            globalSliceUsage
          )
        }
      }

      components.forEach(component => {
        const allStaticQueries = new Set(globalStaticQueries)
        // we only add global slices to pages, not other slices
        let allSlices: Record<string, ICollectedSlice> = component.isSlice
          ? {}
          : cloneDeep(globalSliceUsage)

        if (chunkGroupsByComponentPath.has(component.componentPath)) {
          const chunkGroup = chunkGroupsByComponentPath.get(
            component.componentPath
          )
          if (chunkGroup) {
            const staticQueriesForChunkGroup =
              staticQueriesByChunkGroup.get(chunkGroup)

            if (staticQueriesForChunkGroup) {
              staticQueriesForChunkGroup.forEach(staticQuery => {
                allStaticQueries.add(staticQuery)
              })
            }

            const slicesForChunkGroup =
              pageSliceUsageByChunkGroup.get(chunkGroup)

            if (slicesForChunkGroup) {
              allSlices = mergePreviouslyCollectedSlices(
                slicesForChunkGroup,
                allSlices
              )
            }
          }
        }

        // modules, chunks, chunkgroups can all have not-deterministic orders so
        // just sort array of static queries we produced to ensure final result is deterministic
        const staticQueryHashes = Array.from(allStaticQueries).sort()
        const slices = Object.keys(allSlices)
          .sort()
          .reduce((obj, key) => {
            obj[key] = allSlices[key]
            return obj
          }, {})

        const didStaticQueriesChange = !isEqual(
          this.store
            .getState()
            .staticQueriesByTemplate.get(component.componentPath),
          staticQueryHashes
        )

        const didSlicesChange = !isEqual(
          this.store.getState().slicesByTemplate.get(component.componentPath),
          slices
        )

        if (didStaticQueriesChange || didSlicesChange) {
          if (component.isSlice) {
            this.store.dispatch({
              type: `ADD_PENDING_SLICE_TEMPLATE_DATA_WRITE`,
              payload: {
                componentPath: component.componentPath,
                sliceNames: component.pages,
              },
            })
          } else {
            this.store.dispatch({
              type: `ADD_PENDING_TEMPLATE_DATA_WRITE`,
              payload: {
                componentPath: component.componentPath,
                pages: component.pages,
              },
            })
          }
        }

        if (didSlicesChange) {
          this.store.dispatch({
            type: `SET_SLICES_BY_TEMPLATE`,
            payload: {
              componentPath: component.componentPath,
              slices,
            },
          })
        }

        if (didStaticQueriesChange) {
          this.store.dispatch({
            type: `SET_STATIC_QUERIES_BY_TEMPLATE`,
            payload: {
              componentPath: component.componentPath,
              staticQueryHashes,
            },
          })
        }
      })

      // In dev mode we want to write page-data when compilation succeeds
      if (!stats.hasErrors() && compiler.watchMode) {
        enqueueFlush()
      }
    })
  }
}
