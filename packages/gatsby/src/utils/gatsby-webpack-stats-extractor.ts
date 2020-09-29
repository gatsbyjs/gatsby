import fs from "fs-extra"
import path from "path"
import { Compiler } from "webpack"

export class GatsbyWebpackStatsExtractor {
  private plugin: { name: string }
  constructor() {
    this.plugin = { name: `GatsbyWebpackStatsExtractor` }
  }
  apply(compiler: Compiler): void {
    compiler.hooks.done.tapAsync(this.plugin.name, (stats, done) => {
      const assets = {}
      const assetsMap = {}
      for (const chunkGroup of stats.compilation.chunkGroups) {
        if (chunkGroup.name) {
          const files: Array<string> = []
          for (const chunk of chunkGroup.chunks) {
            files.push(...chunk.files)
          }
          assets[chunkGroup.name] = files.filter(f => f.slice(-4) !== `.map`)
          assetsMap[chunkGroup.name] = files
            .filter(
              f =>
                f.slice(-4) !== `.map` &&
                f.slice(0, chunkGroup.name.length) === chunkGroup.name
            )
            .map(filename => `/${filename}`)
        }
      }
      const webpackStats = {
        ...stats.toJson({ all: false, chunkGroups: true }),
        assetsByChunkName: assets,
      }
      fs.writeFile(
        path.join(`public`, `chunk-map.json`),
        JSON.stringify(assetsMap),
        () => {
          fs.writeFile(
            path.join(`public`, `webpack.stats.json`),
            JSON.stringify(webpackStats),
            done
          )
        }
      )
    })
  }
}
