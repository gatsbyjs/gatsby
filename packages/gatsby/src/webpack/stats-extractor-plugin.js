const fs = require(`fs-extra`)
const path = require(`path`)
const uniq = require(`lodash/uniq`)
const chunkSorter = require(`./chunk-sorter`)

const chunkOnlyConfig = {
  assets: false,
  cached: false,
  children: false,
  chunks: true,
  chunkModules: false,
  chunkOrigins: false,
  errorDetails: false,
  hash: false,
  modules: false,
  reasons: false,
  source: false,
  timings: false,
  version: false,
}

module.exports = class GatsbyStatsExtractor {
  constructor() {
    this.statsPath = path.join(`public`, `webpack.stats.json`)
    this.chunkMapPath = path.join(`public`, `chunk-map.json`)
  }

  sortChunks(stats) {
    const { chunks } = stats.toJson(chunkOnlyConfig)
    return chunkSorter(chunks, stats.compilation.chunkGroups)
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise(
      `gatsby-webpack-stats-extractor`,
      async stats => {
        let assets = { js: [], css: [] }
        let assetsByChunkName = {}
        let assetsMap = {}

        const chunks = this.sortChunks(stats)
        const jsonStats = stats.toJson({
          all: false,
          chunkGroups: true,
          chunks: true,
        })
        const groups = jsonStats.namedChunkGroups

        for (let chunk of chunks) {
          const [chunkName] = chunk.names || []
          const chunkGroup = groups[chunkName]

          if (chunkName && chunkGroup) {
            let files = uniq(
              (groups[chunkName].assets || []).filter(f => !f.endsWith(`.map`))
            )

            files.forEach(file => {
              if (file.endsWith(`.js`))
                assets.js.push({ file, chunkName, rel: `preload` })
              if (file.endsWith(`.css`))
                assets.css.push({ file, chunkName, rel: `preload` })
            })

            Object.entries(chunkGroup.childAssets).forEach(
              ([rel, childAssets]) => {
                childAssets.filter(a => !files.includes(a)).forEach(file => {
                  if (file.endsWith(`.js`))
                    assets.js.push({ rel, file, chunkName })
                  if (file.endsWith(`.css`))
                    assets.css.push({ rel, file, chunkName })
                })
              }
            )

            assetsByChunkName[chunkName] = (
              assetsByChunkName[chunkName] || []
            ).concat(files)

            assetsMap[chunkName] = (assetsMap[chunkName] || []).concat(
              files
                .filter(f => f.startsWith(chunkName))
                .map(filename => `/${filename}`)
            )
          }
        }

        const webpackStats = {
          ...jsonStats,
          assetsByChunkName,
          assets,
        }

        await fs.outputJson(this.chunkMapPath, assetsMap)
        await fs.outputJson(this.statsPath, webpackStats)
      }
    )
  }
}
