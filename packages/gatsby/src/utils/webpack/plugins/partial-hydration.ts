import * as path from "path"
import * as fs from "fs-extra"
import Template from "webpack/lib/Template"
import ModuleDependency from "webpack/lib/dependencies/ModuleDependency"
import NullDependency from "webpack/lib/dependencies/NullDependency"
import url from "url"
import webpack, { Module, NormalModule, Dependency, javascript } from "webpack"

interface IModuleExport {
  id: string
  chunks: Array<string>
  name: string
}

interface IResolveData {
  createData: {
    resource: string
  }
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

/**
 * inspiration and code mostly comes from https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js
 */
export class PartialHydrationPlugin {
  name = `PartialHydrationPlugin`
  _manifestPath: string
  _rootFilePath: string
  _references: Array<ClientReferenceDependency> = []
  _clientModules = new Set<webpack.NormalModule>()

  constructor(manifestPath: string, rootFilePath: string) {
    this._manifestPath = manifestPath
    this._rootFilePath = rootFilePath
  }

  _generateClientReferenceChunk(
    module: NormalModule,
    rootContext: string
  ): void {
    this._references.forEach(reference => {
      const chunkName = Template.toPath(
        // @ts-ignore - types are incorrect
        path.relative(rootContext, reference.userRequest)
      )

      const block = new webpack.AsyncDependenciesBlock(
        {
          name: chunkName,
        },
        undefined,
        // @ts-ignore - types are incorrect
        reference.request
      )

      block.addDependency(reference as Dependency)
      module.addBlock(block)
    })
  }

  _collectClientModules(
    request: IResolveData
  ): Promise<ClientReferenceDependency | null> {
    const CHUNK_SIZE = 1 * 1024 // 1kb
    const buffer = Buffer.alloc(CHUNK_SIZE)
    const [resource] = request.createData.resource.split(`?`)

    return new Promise((resolve, reject) => {
      fs.open(resource, `r`, (err, fd) => {
        if (err) {
          reject(err)
          return
        }

        // we only need to read a small chunk to find "client_export"
        fs.read(fd, buffer, 0, CHUNK_SIZE, null, function (err) {
          if (err) {
            reject(err)
            return
          }

          fs.close(fd, function (err) {
            if (err) {
              reject(err)
              return
            }

            const isClientReference = buffer
              .toString()
              .includes(`client export`)
            if (isClientReference) {
              resolve(new ClientReferenceDependency(resource))
            } else {
              resolve(null)
            }

            return
          })

          return
        })

        return
      })
    })
  }

  _generateManifest(
    chunkGroups: webpack.Compilation["chunkGroups"],
    moduleGraph: webpack.Compilation["moduleGraph"],
    chunkGraph: webpack.Compilation["chunkGraph"],
    rootContext: string
  ): Record<string, Record<string, IModuleExport>> {
    const json: Record<string, Record<string, IModuleExport>> = {}

    chunkGroups.forEach(chunkGroup => {
      const chunkIds: Array<string> = chunkGroup.chunks.map(c => c.id as string)

      // @see https://github.com/facebook/react/blob/3f70e68cea8d2ed0f53d35420105ae20e22ce428/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js#L220-L252
      const recordModule = (
        id: string,
        module: Module | NormalModule
      ): void => {
        // TODO: Hook into deps instead of the target module.
        // That way we know by the type of dep whether to include.
        // It also resolves conflicts when the same module is in multiple chunks.
        if (
          // @ts-ignore - types are incorrect
          !module.resource ||
          // @ts-ignore - types are incorrect
          !this._references.some(ref => ref.request === module.resource)
        ) {
          return
        }

        const normalModule: NormalModule = module as NormalModule
        const moduleProvidedExports = moduleGraph
          .getExportsInfo(normalModule)
          .getProvidedExports()

        const moduleExports: Record<string, IModuleExport> = {}
        ;[``, `*`]
          .concat(
            Array.isArray(moduleProvidedExports) ? moduleProvidedExports : []
          )
          .forEach(function (name) {
            moduleExports[name] = {
              id: id,
              chunks: chunkIds,
              name: name,
            }
          })

        const href = url
          .pathToFileURL(normalModule.resource)
          .href.replace(rootContext.replace(/\\/g, `/`), ``)
          .replace(`file:////`, `file://`)
        if (href !== undefined) {
          json[href] = moduleExports
        }
      }

      chunkGroup.chunks.forEach(chunk => {
        const chunkModules = chunkGraph.getChunkModulesIterable(chunk)

        Array.from(chunkModules).forEach(module => {
          const moduleId = chunkGraph.getModuleId(module) as string
          recordModule(moduleId, module)

          // If this is a concatenation, register each child to the parent ID.
          // @ts-ignore - bad types
          if (module.modules) {
            // @ts-ignore - bad types
            module.modules.forEach(function (concatenatedMod) {
              recordModule(moduleId, concatenatedMod)
            })
          }
        })
      })
    })

    return json
  }

  apply(compiler: webpack.Compiler): void {
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

        const handler = (parser: javascript.JavascriptParser): void => {
          parser.hooks.program.tap(this.name, ast => {
            const hasClientExportDirective = ast.body.find(
              statement =>
                statement.type === `ExpressionStatement` &&
                (statement as IDirective).directive === `client export`
            )

            const module = parser.state.module

            if (hasClientExportDirective) {
              this._clientModules.add(module)
            }

            if (module.resource === this._rootFilePath) {
              this._generateClientReferenceChunk(
                module,
                compilation.options.context as string
              )
            }
          })
        }

        normalModuleFactory.hooks.parser
          .for(`javascript/auto`)
          .tap(this.name, handler)
        normalModuleFactory.hooks.parser
          .for(`javascript/esm`)
          .tap(this.name, handler)
        normalModuleFactory.hooks.parser
          .for(`javascript/dynamic`)
          .tap(this.name, handler)

        normalModuleFactory.hooks.afterResolve.tapAsync(
          this.name,
          (request, cb) => {
            this._collectClientModules(request as unknown as IResolveData)
              .then(dep => {
                if (dep) {
                  this._references.push(dep)
                }

                cb()
              })
              .catch(err => {
                cb(err)
              })
          }
        )

        compilation.hooks.processAssets.tap(
          {
            name: this.name,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const manifest = this._generateManifest(
              compilation.chunkGroups,
              compilation.moduleGraph,
              compilation.chunkGraph,
              compilation.options.context as string
            )

            compilation.emitAsset(
              this._manifestPath,
              new webpack.sources.RawSource(
                JSON.stringify(manifest, null, 2),
                false
              )
            )
          }
        )
      }
    )
  }
}
