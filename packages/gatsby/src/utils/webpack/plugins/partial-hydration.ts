import * as path from "path"
import fs from "fs-extra"
import Template from "webpack/lib/Template"
import ModuleDependency from "webpack/lib/dependencies/ModuleDependency"
import NullDependency from "webpack/lib/dependencies/NullDependency"
import { createNormalizedModuleKey } from "../utils/create-normalized-module-key"
import webpack, {
  Module,
  NormalModule,
  Dependency,
  javascript,
  Compilation,
  Compiler,
} from "webpack"
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule"
import type Reporter from "gatsby-cli/lib/reporter"
import { store } from "../../../redux"
import { getRealPath } from "./static-query-mapper"

interface IModuleExport {
  id: string
  chunks: Array<string>
  name: string
}

interface IDirective {
  directive?: string
}

/**
 * @see https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js#L27-L35
 */
class ClientReferenceDependency extends ModuleDependency {
  constructor(request) {
    super(request)
  }

  get type(): string {
    return `client-reference`
  }
}

export const PARTIAL_HYDRATION_CHUNK_REASON = `PartialHydration client module`

/**
 * inspiration and code mostly comes from https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js
 */
export class PartialHydrationPlugin {
  name = `PartialHydrationPlugin`

  _manifestPath: string // Absolute path to where the manifest file should be written
  _reporter: typeof Reporter

  _references: Array<ClientReferenceDependency> = []
  _clientModules = new Set<webpack.NormalModule>()
  _previousManifest = {}
  _handledClientSSRLoader = ``

  constructor(manifestPath: string, reporter: typeof Reporter) {
    this._manifestPath = manifestPath
    this._reporter = reporter
  }

  _generateClientReferenceChunk(
    reference: NormalModule,
    module: NormalModule,
    rootContext: string
  ): void {
    const chunkName = Template.toPath(
      // @ts-ignore - types are incorrect
      path.relative(rootContext, reference.userRequest)
    )

    const dep = new ClientReferenceDependency(reference.rawRequest)
    const block = new webpack.AsyncDependenciesBlock(
      {
        name: chunkName,
      },
      undefined,
      // @ts-ignore - types are incorrect
      reference.request
    )

    block.addDependency(dep as Dependency)
    module.addBlock(block)
  }

  _generateManifest(
    compilation: Compilation,
    rootContext: string
  ): Record<string, Record<string, IModuleExport>> {
    const _chunkGroups = compilation.chunkGroups
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

      if (normalModule.modules) {
        normalModule.modules.forEach(mod => {
          if (this._clientModules.has(mod)) {
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
        if (this._clientModules.has(normalModule)) {
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

    const toRecord: Map<
      webpack.Module,
      Map<
        webpack.Module,
        Array<{
          originalExport: string
          resolvedExport: string
        }>
      >
    > = new Map()

    function stuff(module): any {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childMap = new Map()
      toRecord.set(module, childMap)

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

    const newClientModules = new Set()
    compilation.chunkGroups.forEach(chunkGroup => {
      chunkGroup.chunks.forEach((chunk: webpack.Chunk) => {
        const chunkModules = compilation.chunkGraph.getChunkModulesIterable(
          chunk
          // TODO: Update type so that it doesn't have to be cast.
        ) as Iterable<webpack.NormalModule>
        for (const mod of chunkModules) {
          if (mod.buildInfo.rsc) {
            mapOriginalModuleToPotentiallyConcatanetedModule.set(mod, mod)
            newClientModules.add(mod)
          }

          if (mod.modules) {
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
      stuff(clientModule)

      const incomingConnections =
        moduleGraph.getIncomingConnections(clientModule)

      for (const connection of incomingConnections) {
        if (connection.dependency) {
          if (toRecord.has(connection.module)) {
            continue
          }

          stuff(connection.module)
        }
      }
    }

    console.log({ toRecord })
    // debugger

    for (const [originalModule, resolvedMap] of toRecord) {
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

    toRecord.clear()

    return json
  }

  async addClientModuleEntries(
    // @ts-ignore
    compiler: Compiler,
    compilation: Compilation
  ): Promise<void> {
    // @ts-ignore
    const loaderOptions = {
      modules: this._clientModules,
    }

    const clientSSRLoader = `gatsby/dist/utils/webpack/loaders/virtual?modules=${Array.from(
      this._clientModules
    )
      .map(
        module =>
          // console.log({ module })
          module.userRequest
      )
      .join(`,`)}!`

    // if (clientSSRLoader !== this._handledClientSSRLoader) {
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

        // console.log(`???`, {
        //   entry,
        //   options,
        //   entries: compilation.entries,
        //   cname: compilation.name,
        // })

        if (!oldEntry) {
          resolve(null)
          return
        }
        // const includeDependencies = oldEntry.includeDependencies

        // console.log({ includeDependencies })
        // if (!includeDependencies.has(e))
        // @ts-ignore
        oldEntry.includeDependencies.push(entry)
        compilation.hooks.addEntry.call(entry, options)
        compilation.addModuleTree(
          {
            context,
            dependency: entry,
          },
          // @ts-ignore
          (err: Error | undefined, module: any) => {
            // console.log(`addModuleTree callback`, { err, module })
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
        return
      }
      console.log(`==== finish make ===`)
      await this.addClientModuleEntries(compiler, compilation)
    })

    compiler.hooks.thisCompilation.tap(
      this.name,
      (compilation, { normalModuleFactory }) => {
        // tell webpack that this is a regular javascript module
        compilation.dependencyFactories.set(
          ClientReferenceDependency as ModuleDependency,
          normalModuleFactory
        )
        // don't add extra code to the source file
        compilation.dependencyTemplates.set(
          ClientReferenceDependency as ModuleDependency,
          new NullDependency.Template()
        )

        // const entryModule: webpack.NormalModule | null = null
        const handler = (parser: javascript.JavascriptParser): void => {
          parser.hooks.program.tap(this.name, ast => {
            const hasClientExportDirective = ast.body.find(
              statement =>
                statement.type === `ExpressionStatement` &&
                (statement as IDirective).directive === `use client`
            )

            const module = parser.state.module

            if (hasClientExportDirective) {
              module.buildInfo.rsc = true
              this._clientModules.add(module)

              // if (entryModule) {
              //   console.log(`parse`, module.resource)
              //   this._generateClientReferenceChunk(
              //     module,
              //     entryModule,
              //     compilation.options.context as string
              //   )
              //   entryModule.invalidateBuild()
              // }
            }

            // if (module.resource.includes(`production-app`) && !entryModule) {
            //   entryModule = module

            //   for (const clientModule of this._clientModules) {
            //     this._generateClientReferenceChunk(
            //       clientModule,
            //       entryModule,
            //       compilation.options.context as string
            //     )
            //   }
            // }
          })
        }

        compilation.hooks.optimizeChunks.tap(this.name, () => {
          const { components } = store.getState()
          const realPathCache = new Map<string, string>()

          compilation.modules.forEach(webpackModule => {
            if (webpackModule.buildInfo.rsc) {
              return
            }

            for (const [id, component] of components) {
              const componentComponentPath = getRealPath(
                realPathCache,
                component.componentPath
              )

              if (!(webpackModule instanceof ConcatenatedModule)) {
                if (
                  !(
                    (webpackModule as NormalModule).resource ===
                    componentComponentPath + `?export=default`
                  )
                ) {
                  continue
                }
              } else {
                // ConcatenatedModule is a collection of modules so we have to go deeper to actually get it
                if (
                  !webpackModule.modules.some(
                    innerModule =>
                      (innerModule as NormalModule).resource ===
                      componentComponentPath + `?export=default`
                  )
                ) {
                  continue
                }
              }

              const connections =
                compilation.moduleGraph.getIncomingConnections(webpackModule)
              for (const connection of connections) {
                if (connection.dependency) {
                  compilation.moduleGraph.removeConnection(
                    connection.dependency
                  )
                }
              }

              const chunks = webpackModule.chunksIterable
              for (const chunk of chunks) {
                console.log(`discconect`, {
                  name: chunk.name,
                  canBeInitial: chunk.canBeInitial(),
                  isOnlyInitial: chunk.isOnlyInitial(),
                })

                compilation.chunkGraph.disconnectChunk(chunk)
                compilation.chunks.delete(chunk)
                chunk.disconnectFromGroups()
              }

              compilation.modules.delete(webpackModule)
            }
          })
        })

        // compilation.hooks.optimizeChunks.tap(
        //   this.name,
        //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //   () => {
        //     // 1. move clientModules into their own chunk
        //     // 2. disconnect module from original chunk

        //     for (const clientModule of this._clientModules) {
        //       const chunkName = Template.toPath(
        //         // @ts-ignore - types are incorrect
        //         path.relative(
        //           compilation.options.context as string,
        //           clientModule.userRequest
        //         )
        //       )

        //       const chunk = compilation.addChunk(chunkName)
        //       chunk.chunkReason = PARTIAL_HYDRATION_CHUNK_REASON

        //       const handledModules = new Set()

        //       function moveModuleToChunk(
        //         clientModule: webpack.Module,
        //         chunk: webpack.Chunk
        //       ): void {
        //         if (handledModules.has(clientModule)) {
        //           return
        //         }

        //         handledModules.add(clientModule)

        //         const selectedChunks = Array.from(
        //           compilation.chunkGraph.getModuleChunksIterable(clientModule)
        //         )

        //         for (const connectedChunk of selectedChunks) {
        //           if (connectedChunk.name === `app`) {
        //             return
        //           }
        //         }

        //         compilation.chunkGraph.connectChunkAndModule(
        //           chunk,
        //           clientModule
        //         )

        //         for (const connectedChunk of selectedChunks) {
        //           compilation.chunkGraph.disconnectChunkAndModule(
        //             connectedChunk,
        //             clientModule
        //           )
        //           connectedChunk.split(chunk)
        //         }

        //         const uniqueDependencyModules = new Set(
        //           clientModule.dependencies.map(r =>
        //             compilation.moduleGraph.getModule(r)
        //           )
        //         )

        //         for (const dependencyModule of uniqueDependencyModules) {
        //           if (dependencyModule) {
        //             moveModuleToChunk(dependencyModule, chunk)
        //           }
        //         }
        //       }

        //       moveModuleToChunk(clientModule, chunk)
        //     }
        //   }
        // )

        normalModuleFactory.hooks.parser
          .for(`javascript/auto`)
          .tap(this.name, handler)
        normalModuleFactory.hooks.parser
          .for(`javascript/esm`)
          .tap(this.name, handler)
        normalModuleFactory.hooks.parser
          .for(`javascript/dynamic`)
          .tap(this.name, handler)

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
