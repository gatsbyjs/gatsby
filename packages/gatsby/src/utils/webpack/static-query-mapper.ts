import path from "path"
import { Store } from "redux"
import { Compiler, Module, NormalModule, Compilation } from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
import {
  IGatsbyState,
  IGatsbyPageComponent,
  IGatsbyStaticQueryComponents,
} from "../../redux/types"
import { enqueueFlush } from "../page-data"

type ChunkGroup = Compilation["chunkGroups"][0]

/**
 * Checks if a module matches a resourcePath
 */
function doesModuleMatchResourcePath(
  resourcePath: string,
  webpackModule: Module | NormalModule | ConcatenatedModule
): boolean {
  if (!(webpackModule instanceof ConcatenatedModule)) {
    return (webpackModule as NormalModule).resource === resourcePath
  }

  // ConcatenatedModule is a collection of modules so we have to go deeper to actually get it
  return webpackModule.modules.some(
    innerModule => (innerModule as NormalModule).resource === resourcePath
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
  components: IGatsbyState["components"]
): {
  webpackModulesByStaticQueryId: Map<string, Module>
  webpackModulesByComponentId: Map<string, Module>
} {
  const realPathCache = new Map<string, string>()
  const webpackModulesByStaticQueryId = new Map<string, Module>()
  const webpackModulesByComponentId = new Map<string, Module>()

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

      webpackModulesByStaticQueryId.set(id, webpackModule)
    }

    for (const [id, component] of components) {
      const componentComponentPath = getRealPath(
        realPathCache,
        component.componentPath
      )
      if (!doesModuleMatchResourcePath(componentComponentPath, webpackModule)) {
        continue
      }

      webpackModulesByComponentId.set(id, webpackModule)
    }
  })

  return { webpackModulesByStaticQueryId, webpackModulesByComponentId }
}

export class StaticQueryMapper {
  private store: Store<IGatsbyState>
  private name: string

  constructor(store) {
    this.store = store
    this.name = `StaticQueryMapper`
  }

  apply(compiler: Compiler): void {
    const { components, staticQueryComponents } = this.store.getState()

    compiler.hooks.done.tap(this.name, stats => {
      const compilation = stats.compilation
      // We only care about the main compilation
      // Chunkgraph should alwasy be available when it's done but you know typescript.
      if (compilation.compiler.parentCompilation || !compilation.chunkGraph) {
        return
      }

      const staticQueriesByChunkGroup = new Map<ChunkGroup, Array<string>>()
      const chunkGroupsWithPageComponents = new Set<ChunkGroup>()
      const chunkGroupsByComponentPath = new Map<
        IGatsbyPageComponent["componentPath"],
        ChunkGroup
      >()

      const {
        webpackModulesByStaticQueryId,
        webpackModulesByComponentId,
      } = getWebpackModulesByResourcePaths(
        compilation.modules,
        staticQueryComponents,
        components
      )

      // group hashes by chunkGroup for ease of use
      for (const [
        staticQueryId,
        webpackModule,
      ] of webpackModulesByStaticQueryId) {
        for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
          webpackModule
        )) {
          for (const chunkGroup of chunk.groupsIterable) {
            const staticQueryHashes =
              staticQueriesByChunkGroup.get(chunkGroup) ?? []

            staticQueryHashes.push(
              (staticQueryComponents.get(
                staticQueryId
              ) as IGatsbyStaticQueryComponents).hash
            )

            staticQueriesByChunkGroup.set(chunkGroup, staticQueryHashes)
          }
        }
      }

      // group chunkGroups by componentPaths for ease of use
      for (const [
        componentPath,
        webpackModule,
      ] of webpackModulesByComponentId) {
        for (const chunk of compilation.chunkGraph.getModuleChunksIterable(
          webpackModule
        )) {
          for (const chunkGroup of chunk.groupsIterable) {
            chunkGroupsWithPageComponents.add(chunkGroup)
            chunkGroupsByComponentPath.set(componentPath, chunkGroup)
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

      components.forEach(component => {
        const allStaticQueries = new Set(globalStaticQueries)
        if (chunkGroupsByComponentPath.has(component.componentPath)) {
          const chunkGroup = chunkGroupsByComponentPath.get(
            component.componentPath
          )
          if (chunkGroup && staticQueriesByChunkGroup.has(chunkGroup)) {
            ;(staticQueriesByChunkGroup.get(chunkGroup) as Array<
              string
            >).forEach(staticQuery => {
              allStaticQueries.add(staticQuery)
            })
          }
        }

        this.store.dispatch({
          type: `ADD_PENDING_TEMPLATE_DATA_WRITE`,
          payload: {
            componentPath: component.componentPath,
            pages: component.pages,
          },
        })

        this.store.dispatch({
          type: `SET_STATIC_QUERIES_BY_TEMPLATE`,
          payload: {
            componentPath: component.componentPath,
            staticQueryHashes: Array.from(allStaticQueries),
          },
        })
      })

      // In dev mode we want to write page-data when compilation succeeds
      if (!stats.hasErrors() && compiler.watchMode) {
        enqueueFlush()
      }
    })
  }
}
