import fs from "fs-extra"
import path from "path"
import { Compiler } from "webpack"
import { PARTIAL_HYDRATION_CHUNK_REASON } from "./webpack/plugins/partial-hydration"
import { store } from "../redux"
import { ensureFileContent } from "./ensure-file-content"
import { setWebpackAssets } from "./adapter/manager"

let previousChunkMapJson: string | undefined
let previousWebpackStatsJson: string | undefined

export class GatsbyWebpackStatsExtractor {
  private plugin: { name: string }
  private publicPath: string

  constructor(publicPath: string) {
    this.plugin = { name: `GatsbyWebpackStatsExtractor` }
    this.publicPath = publicPath
  }
  apply(compiler: Compiler): void {
    compiler.hooks.done.tapAsync(this.plugin.name, async (stats, done) => {
      const assets: { [key: string]: Array<string> } = {}
      const assetsMap = {}
      const childAssets = {}
      for (const chunkGroup of stats.compilation.chunkGroups) {
        if (chunkGroup.name) {
          const files: Array<string> = []
          for (const chunk of chunkGroup.chunks) {
            if (chunk.chunkReason !== PARTIAL_HYDRATION_CHUNK_REASON) {
              files.push(...chunk.files)
            }
          }
          assets[chunkGroup.name] = files.filter(f => f.slice(-4) !== `.map`)
          assetsMap[chunkGroup.name] = files
            .filter(
              f =>
                f.slice(-4) !== `.map` &&
                f.slice(0, chunkGroup.name?.length) === chunkGroup.name
            )
            .map(filename => `/${filename}`)

          for (const [rel, childChunkGroups] of Object.entries(
            chunkGroup.getChildrenByOrders(
              stats.compilation.moduleGraph,
              stats.compilation.chunkGraph
            )
          )) {
            if (!(chunkGroup.name in childAssets)) {
              childAssets[chunkGroup.name] = {}
            }

            const childFiles: Array<string> = []
            for (const childChunkGroup of childChunkGroups) {
              for (const chunk of childChunkGroup.chunks) {
                childFiles.push(...chunk.files)
              }
            }

            childAssets[chunkGroup.name][rel] = childFiles
          }
        }
      }

      const {
        namedChunkGroups = {},
        name = ``,
        ...assetsRelatedStats
      } = stats.toJson({
        all: false,
        chunkGroups: true,
        cachedAssets: true,
        assets: true,
      })

      const webpackStats = {
        name,
        namedChunkGroups,
        assetsByChunkName: assets,
        childAssetsByChunkName: childAssets,
      }

      if (assetsRelatedStats.assets) {
        const assets = new Set<string>()
        for (const asset of assetsRelatedStats.assets) {
          assets.add(asset.name)

          if (asset.info.related) {
            for (const relatedAssets of Object.values(asset.info.related)) {
              if (Array.isArray(relatedAssets)) {
                for (const relatedAsset of relatedAssets) {
                  assets.add(relatedAsset)
                }
              } else {
                assets.add(relatedAssets)
              }
            }
          }
        }
        setWebpackAssets(assets)
      }

      const newChunkMapJson = JSON.stringify(assetsMap)
      if (newChunkMapJson !== previousChunkMapJson) {
        await fs.writeFile(
          path.join(`public`, `chunk-map.json`),
          newChunkMapJson
        )

        if (_CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_SLICES) {
          // Add chunk mapping metadata to scripts slice
          const scriptChunkMapping = `window.___chunkMapping=${JSON.stringify(
            newChunkMapJson
          )};`

          const chunkSliceContents = `
          <script
            id="gatsby-chunk-mapping"
          >
            ${scriptChunkMapping}
          </script>
        `

          await fs.ensureDir(path.join(`public`, `_gatsby`, `slices`))

          const hashSliceContents = `<script>window.___webpackCompilationHash="${stats.hash}";</script>`

          const assetSliceContents: Array<string> = []

          if (`polyfill` in assets && assets.polyfill) {
            for (const asset of assets.polyfill) {
              if (asset.endsWith(`.js`)) {
                assetSliceContents.push(
                  `<script src="${this.publicPath}/${asset}" nomodule></script>`
                )
              }
            }
          }

          if (`app` in assets && assets.app) {
            for (const asset of assets.app) {
              if (asset.endsWith(`.js`)) {
                assetSliceContents.push(
                  `<script src="${this.publicPath}/${asset}" async></script>`
                )
              }
            }
          }

          const scriptsSliceHtmlChanged = await ensureFileContent(
            path.join(`public`, `_gatsby`, `slices`, `_gatsby-scripts-1.html`),
            chunkSliceContents + hashSliceContents + assetSliceContents.join(``)
          )

          if (scriptsSliceHtmlChanged) {
            store.dispatch({
              type: `SLICES_SCRIPTS_REGENERATED`,
            })
          }
        }

        previousChunkMapJson = newChunkMapJson
      }

      const newWebpackStatsJson = JSON.stringify(webpackStats)
      if (newWebpackStatsJson !== previousWebpackStatsJson) {
        await fs.writeFile(
          path.join(`public`, `webpack.stats.json`),
          newWebpackStatsJson
        )
        previousWebpackStatsJson = newWebpackStatsJson
      }

      done()
    })
  }
}
