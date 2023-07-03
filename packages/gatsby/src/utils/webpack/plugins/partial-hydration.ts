import * as path from "path"
import fs from "fs-extra"
import { createNormalizedModuleKey } from "../utils/create-normalized-module-key"
import webpack, {
  Module,
  NormalModule,
  javascript,
  Compilation,
  Compiler,
  AsyncDependenciesBlock,
} from "webpack"
import type Reporter from "gatsby-cli/lib/reporter"

interface IModuleExport {
  id: string
  chunks: Array<string>
  name: string
}

interface IDirective {
  directive?: string
}

export const PARTIAL_HYDRATION_CHUNK_REASON = `PartialHydration client module`

/**
 * inspiration and code mostly comes from https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js
 */
export class PartialHydrationPlugin {
  name = `PartialHydrationPlugin`

  _manifestPath: string // Absolute path to where the manifest file should be written
  _reporter: typeof Reporter

  _collectedCssModules = new Set<webpack.Module>()
  _previousManifest = {}

  constructor(manifestPath: string, reporter: typeof Reporter) {
    this._manifestPath = manifestPath
    this._reporter = reporter
  }

  _generateManifest(
    compilation: Compilation,
    rootContext: string
  ): Record<string, Record<string, IModuleExport>> {
    const moduleGraph = compilation.moduleGraph
    const chunkGraph = compilation.chunkGraph

    const json: Record<string, Record<string, IModuleExport>> = {}
    const mapOriginalModuleToPotentiallyConcatanetedModule = new Map()
    // @see https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js#L220-L252
    const recordModule = (
      id: string,
      module: Module | NormalModule,
      exports: Array<{ originalExport: string; resolvedExport: string }>,
      chunkIds: Array<string>
    ): void => {
      const normalModule: NormalModule = module as NormalModule

      const moduleExports: Record<string, IModuleExport> = {}
      exports.forEach(({ originalExport, resolvedExport }) => {
        moduleExports[originalExport] = {
          id: id,
          chunks: chunkIds,
          name: resolvedExport,
        }
      })

      // @ts-ignore
      if (normalModule.modules) {
        // @ts-ignore
        normalModule.modules.forEach(mod => {
          if (mod.buildInfo.rsc) {
            const normalizedModuleKey = createNormalizedModuleKey(
              mod.resource,
              rootContext
            )

            if (normalizedModuleKey !== undefined) {
              json[normalizedModuleKey] = moduleExports
            }
          }
        })
      } else {
        if (normalModule.buildInfo?.rsc) {
          const normalizedModuleKey = createNormalizedModuleKey(
            normalModule.resource,
            rootContext
          )

          if (normalizedModuleKey !== undefined) {
            json[normalizedModuleKey] = moduleExports
          }
        }
      }
    }

    const ClientModulesToRecord: Map<
      webpack.Module,
      Map<
        webpack.Module,
        Array<{
          originalExport: string
          resolvedExport: string
        }>
      >
    > = new Map()

    function recordModuleExports(module): any {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childMap = new Map()
      ClientModulesToRecord.set(module, childMap)

      for (const exportInfo of moduleGraph.getExportsInfo(module).exports) {
        if (exportInfo.isReexport()) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const targetInfo = exportInfo.getTarget(moduleGraph)!
          if (!childMap.has(targetInfo.module)) {
            childMap.set(targetInfo.module, [])
          }

          childMap.get(targetInfo.module)?.push({
            originalExport: exportInfo.name,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolvedExport: targetInfo.export![0],
          })
        } else {
          if (!childMap.has(module)) {
            childMap.set(module, [])
          }

          childMap.get(module)?.push({
            originalExport: exportInfo.name,
            resolvedExport: exportInfo.name,
          })
        }
      }
    }

    const newClientModules = new Set<webpack.Module>()
    compilation.chunkGroups.forEach(chunkGroup => {
      chunkGroup.chunks.forEach((chunk: webpack.Chunk) => {
        const chunkModules =
          compilation.chunkGraph.getChunkModulesIterable(chunk)
        for (const mod of chunkModules) {
          if (mod.buildInfo?.rsc) {
            mapOriginalModuleToPotentiallyConcatanetedModule.set(mod, mod)
            newClientModules.add(mod)
          }

          // @ts-ignore
          if (mod.modules) {
            // @ts-ignore
            for (const subMod of mod.modules) {
              if (subMod.buildInfo.rsc) {
                mapOriginalModuleToPotentiallyConcatanetedModule.set(
                  subMod,
                  mod
                )
                newClientModules.add(mod)
              }
            }
          }
        }
      })
    })

    for (const clientModule of newClientModules) {
      recordModuleExports(clientModule)

      const incomingConnections =
        moduleGraph.getIncomingConnections(clientModule)

      for (const connection of incomingConnections) {
        if (connection.dependency) {
          if (ClientModulesToRecord.has(connection.module)) {
            continue
          }

          recordModuleExports(connection.module)
        }
      }
    }

    for (const [originalModule, resolvedMap] of ClientModulesToRecord) {
      for (const [resolvedModule, exports] of resolvedMap) {
        const chunkIds: Set<string> = new Set()

        const chunks = chunkGraph.getModuleChunksIterable(resolvedModule)

        for (const chunk of chunks) {
          if (chunk.id) {
            chunkIds.add(chunk.id as string)
          }
        }

        const moduleId = chunkGraph.getModuleId(resolvedModule) as string
        recordModule(moduleId, originalModule, exports, Array.from(chunkIds))
      }
    }

    ClientModulesToRecord.clear()

    return json
  }

  async addClientModuleEntries(
    // @ts-ignore
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    const clientModules: Array<webpack.NormalModule> = []
    const cssModules = (this._collectedCssModules = new Set())

    const visited = new Set<webpack.Module>()
    function collectCssModules(module: webpack.Module): void {
      if (visited.has(module)) {
        return
      }
      visited.add(module)
      if (module.buildInfo?.rsc) {
        return
      }

      if (module.type === `css/mini-extract`) {
        cssModules.add(module)
      }

      const outgoingConnections =
        compilation.moduleGraph.getOutgoingConnections(module)

      for (const connection of outgoingConnections) {
        if (connection.dependency) {
          collectCssModules(connection.module)
        }
      }
    }

    let asyncRequires: NormalModule | null = null
    for (const module of compilation.modules) {
      if (module instanceof NormalModule) {
        if (module.buildInfo?.rsc) {
          clientModules.push(module)
        } else if (module.request.endsWith(`export=default`)) {
          const incomingConnections =
            compilation.moduleGraph.getIncomingConnections(module)

          for (const connection of incomingConnections) {
            if (connection.dependency) {
              const dependencyBlock = compilation.moduleGraph.getParentBlock(
                connection.dependency
              )

              if (
                dependencyBlock instanceof AsyncDependenciesBlock &&
                dependencyBlock?.chunkName?.startsWith(`slice---`)
              ) {
                continue
              }

              if (connection.originModule instanceof NormalModule) {
                if (
                  connection.originModule.resource.includes(`async-requires`)
                ) {
                  asyncRequires = connection.originModule

                  // Remove page template "import" from async-requires.
                  // Note that if other imports to a template will remain it will remain in the bundle:
                  // that can happen if template is marked with "use client" or if other client component
                  // will import it. We don't want to force remove template - we just want to remove the
                  // import from async-requires and let webpack remove it rom the bundle (or rather just not add it)
                  // if it's not used anywhere else
                  compilation.moduleGraph.removeConnection(
                    connection.dependency
                  )
                }
              }
            }
          }

          // find css modules that are imported by this module
          collectCssModules(module)
        }
      }
    }

    if (!asyncRequires) {
      throw new Error(`couldn't find async-requires module`)
    }

    const clientSSRLoader = `gatsby/dist/utils/webpack/loaders/client-components-requires-writer-loader?${JSON.stringify(
      {
        modules: clientModules
          .map(
            module =>
              `./` +
              path.relative(
                compilation.options.context as string,
                module.userRequest
              )
          )
          .join(`,`),
      }
    )}!`

    const clientComponentEntryDep = webpack.EntryPlugin.createDependency(
      clientSSRLoader,
      {
        name: `app`,
      }
    )
    await this.addEntry(compilation, ``, clientComponentEntryDep, {
      name: `app`,
    })
  }

  addEntry(
    compilation: Compilation,
    context: string,
    entry: any /* Dependency */,
    options: {
      name: string
    } /* EntryOptions */
  ): Promise<any> /* Promise<module> */ {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      try {
        const oldEntry = compilation.entries.get(options.name)
        if (!oldEntry) {
          resolve(null)
          return
        }

        oldEntry.includeDependencies.push(entry)
        compilation.hooks.addEntry.call(entry, options)
        compilation.addModuleTree(
          {
            context,
            dependency: entry,
          },
          // @ts-ignore
          (err: Error | undefined, module: any) => {
            if (err) {
              compilation.hooks.failedEntry.call(entry, options, err)
              return reject(err)
            }

            compilation.hooks.succeedEntry.call(entry, options, module)
            return resolve(module)
          }
        )
      } catch (e) {
        console.log({ e })
        reject(e)
      }
    })
  }

  apply(compiler: webpack.Compiler): void {
    // Restore manifest from the previous compilation, otherwise it will be wiped since files aren't visited on cached builds
    compiler.hooks.beforeCompile.tap(this.name, () => {
      try {
        const previousManifest = fs.existsSync(this._manifestPath)

        if (!previousManifest) {
          return
        }

        this._previousManifest = JSON.parse(
          fs.readFileSync(this._manifestPath, `utf-8`)
        )
      } catch (error) {
        this._reporter.panic({
          id: `80001`,
          context: {},
          error,
        })
      }
    })

    compiler.hooks.finishMake.tapPromise(this.name, async compilation => {
      if (compilation.compiler.parentCompilation) {
        // child compilation happen for css modules for example, we only care about the main compilation
        return
      }
      await this.addClientModuleEntries(compiler, compilation)
    })

    compiler.hooks.thisCompilation.tap(
      this.name,
      (compilation, { normalModuleFactory }) => {
        const parserCallback = (parser: javascript.JavascriptParser): void => {
          parser.hooks.program.tap(this.name, ast => {
            const hasClientExportDirective = ast.body.find(
              statement =>
                statement.type === `ExpressionStatement` &&
                (statement as IDirective).directive === `use client`
            )

            const module = parser.state.module

            if (hasClientExportDirective) {
              // this metadata will be preserved on warm builds, so we don't need to force parse modules
              // each time, as webpack will manage going through parsing of module is invalidated
              module.buildInfo!.rsc = true
            }
          })
        }

        normalModuleFactory.hooks.parser
          .for(`javascript/auto`)
          .tap(this.name, parserCallback)
        normalModuleFactory.hooks.parser
          .for(`javascript/esm`)
          .tap(this.name, parserCallback)
        normalModuleFactory.hooks.parser
          .for(`javascript/dynamic`)
          .tap(this.name, parserCallback)

        // add dangling css modules to the app entry
        compilation.hooks.optimizeChunks.tap(this.name, () => {
          let appChunk: webpack.Chunk | null = null
          for (const chunk of compilation.chunks) {
            if (chunk.name === `app`) {
              appChunk = chunk
              break
            }
          }

          if (!appChunk) {
            throw new Error(`"app" chunk not found`)
          }

          const modulesToInsertIntoApp: Array<webpack.Module> = []

          for (const cssModule of this._collectedCssModules) {
            const usedInChunks =
              compilation.chunkGraph.getModuleChunksIterable(cssModule)

            let isInAnyChunk = false

            for (const _ of usedInChunks) {
              isInAnyChunk = true
              break
            }
            if (!isInAnyChunk) {
              modulesToInsertIntoApp.push(cssModule)
            }
          }

          for (const cssModule of modulesToInsertIntoApp.sort((a, b) => {
            const _a = compilation.moduleGraph.getPostOrderIndex(a)
            const _b = compilation.moduleGraph.getPostOrderIndex(b)

            if (!_a || !_b) {
              return 0
            } else {
              return _a - _b
            }
          })) {
            compilation.chunkGraph.connectChunkAndModule(appChunk, cssModule)

            for (const group of appChunk.groupsIterable) {
              if (!group.getModulePostOrderIndex(cssModule)) {
                group.setModulePostOrderIndex(
                  cssModule,
                  // @ts-ignore
                  group._modulePostOrderIndices.size + 1
                )
              }
            }
          }
        })

        // generate client components manifest
        compilation.hooks.processAssets.tap(
          {
            name: this.name,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const manifest = this._generateManifest(
              compilation,
              compilation.options.context as string
            )

            /**
             * `emitAsset` is unclear about what the path should be relative to and absolute paths don't work. This works so we'll go with that.
             * @see {@link https://webpack.js.org/api/compilation-object/#emitasset}
             */
            const emitManifestPath = `..${this._manifestPath.replace(
              compiler.context,
              ``
            )}`

            compilation.emitAsset(
              emitManifestPath,
              new webpack.sources.RawSource(
                JSON.stringify(
                  { ...this._previousManifest, ...manifest },
                  null,
                  2
                ),
                false
              )
            )
          }
        )
      }
    )
  }
}
