import { Compiler, Module } from "webpack"

/**
 * This is total hack that is meant to handle:
 *  - https://github.com/webpack-contrib/mini-css-extract-plugin/issues/706
 *  - https://github.com/webpack-contrib/mini-css-extract-plugin/issues/708
 * The way it works it is looking up what HotModuleReplacementPlugin checks internally
 * and tricks it by checking up if any modules that uses mini-css-extract-plugin
 * changed or was newly added and then modifying blank.css hash.
 * blank.css is css module that is used by all pages and is there from the start
 * so changing hash of that _should_ ensure that:
 *  - when new css is imported it will reload css
 *  - when css imported by not loaded (by runtime) page template changes it will reload css
 */
export class ForceCssHMRForEdgeCases {
  private name: string
  private originalBlankCssHash: string
  private blankCssKey: string
  private hackCounter = 0
  private previouslySeenCss: Set<string> = new Set<string>()

  constructor() {
    this.name = `ForceCssHMRForEdgeCases`
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(this.name, compilation => {
      compilation.hooks.fullHash.tap(this.name, () => {
        const chunkGraph = compilation.chunkGraph
        const records = compilation.records

        if (!records.chunkModuleHashes) {
          return
        }

        const seenCssInThisCompilation = new Set<string>()

        let anyCssChanged = false

        for (const chunk of compilation.chunks) {
          const getModuleHash = (module: Module): string => {
            if (compilation.codeGenerationResults.has(module, chunk.runtime)) {
              return compilation.codeGenerationResults.getHash(
                module,
                chunk.runtime
              )
            } else {
              return chunkGraph.getModuleHash(module, chunk.runtime)
            }
          }

          const modules = chunkGraph.getChunkModulesIterable(chunk)

          if (modules !== undefined) {
            for (const module of modules) {
              const key = `${chunk.id}|${module.identifier()}`

              if (
                !this.originalBlankCssHash &&
                module.rawRequest === `./blank.css`
              ) {
                this.blankCssKey = key
                this.originalBlankCssHash =
                  records.chunkModuleHashes[this.blankCssKey]
              }

              const isUsingMiniCssExtract = module.loaders?.find(loader =>
                loader?.loader?.includes(`mini-css-extract-plugin`)
              )

              if (isUsingMiniCssExtract) {
                seenCssInThisCompilation.add(key)
                this.previouslySeenCss.delete(key)

                const hash = getModuleHash(module)
                if (records.chunkModuleHashes[key] !== hash) {
                  anyCssChanged = true
                }
              }
            }
          }
        }

        if (
          (anyCssChanged || this.previouslySeenCss.size > 0) &&
          this.originalBlankCssHash &&
          this.blankCssKey
        ) {
          records.chunkModuleHashes[this.blankCssKey] =
            this.originalBlankCssHash + this.hackCounter++
        }

        this.previouslySeenCss = seenCssInThisCompilation
      })
    })
  }
}
