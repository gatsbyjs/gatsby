import { Compiler, Module } from "webpack"

const MODULE_TYPE = `css/mini-extract`

function deterministicModuleOrderComparator(
  modA: Module,
  modB: Module
): -1 | 0 | 1 {
  const modAIdentifier = modA.identifier()
  const modBIdentifier = modB.identifier()
  if (modAIdentifier < modBIdentifier) {
    return -1
  } else if (modAIdentifier > modBIdentifier) {
    return 1
  } else {
    return 0
  }
}

/**
 * This is temporary hack to override `contentHash` that `mini-css-extract-plugin` sets
 * because it's not deterministic currently (at least for webpack@5).
 * Important part is to have this temporary plugin instance AFTER `mini-css-extract-plugin`
 * because we can't really remove what that plugin is doing, we can only overwrite it
 * @see https://github.com/webpack-contrib/mini-css-extract-plugin/issues/701
 */
export class TmpMiniCssExtractContentHashOverWrite {
  private name: string

  constructor() {
    this.name = `TmpMiniCssExtractContentHashOverWrite`
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(this.name, compilation => {
      compilation.hooks.contentHash.tap(this.name, chunk => {
        const { outputOptions, chunkGraph } = compilation
        if (!chunkGraph) {
          throw new Error(`No chunkGraph`)
        }
        const modules = chunkGraph.getOrderedChunkModulesIterableBySourceType(
          chunk,
          MODULE_TYPE,
          deterministicModuleOrderComparator
        )

        if (modules) {
          const { hashFunction, hashDigest, hashDigestLength } = outputOptions

          if (!hashFunction) {
            throw new Error(`No hashFunction`)
          }
          const createHash = compiler.webpack.util.createHash
          const hash = createHash(hashFunction)

          for (const m of modules) {
            m.updateHash(hash, { chunkGraph, runtime: undefined })
          }

          chunk.contentHash[MODULE_TYPE] = (hash.digest(
            hashDigest
          ) as string).substring(0, hashDigestLength)
        }
      })
    })
  }
}
