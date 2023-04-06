import * as fs from "fs-extra"
import * as path from "path"
import { fixedPagePath } from "gatsby-core-utils"

const publicDir = path.join(__dirname, `..`, `..`, `public`)

type Filter = 'all' | 'page-data' | 'static-query-data' | 'page-template' | 'extra'

function getAssetManifest() {
  const { assetsByChunkName }: { assetsByChunkName: Record<string, Array<string>> } = require(`${publicDir}/webpack.stats.json`)
  return assetsByChunkName
}

function getPageDataPath(pagePath: string) {
  return path.posix.join(`page-data`, fixedPagePath(pagePath), `page-data.json`)
}

const filterAssets = (assetsForPath: Array<string>, filter: Filter) => {
  return assetsForPath.filter(asset => {
    if (filter === `all`) {
      return true
    } else if (filter === `page-data` || filter === "static-query-data") {
      return false
    }

    const isMain = asset.startsWith(`component---`)
    if (filter === `page-template`) {
      return isMain
    } else if (filter === `extra`) {
      return !isMain
    }
    return false
  })
}

function getAssetsForChunk({ filter }: { filter: Filter }) {
  const assetManifest = getAssetManifest()

  return assetManifest[filter].map(asset => `/${asset}`)
}

function getAssetsForPage({ pagePath, filter }: { pagePath: string; filter: Filter }) {
  const assetManifest = getAssetManifest()

  const pageDataUrl = getPageDataPath(pagePath)
  const pageData = JSON.parse(
    fs.readFileSync(path.join(publicDir, pageDataUrl), `utf8`)
  )
  const { componentChunkName } = pageData
  const assetsForPath = assetManifest[componentChunkName]

  const assets = filterAssets(assetsForPath, filter).map(
    assetFileName => `/${assetFileName}`
  )

  if (filter === `all` || filter === `page-data`) {
    assets.push(`/${pageDataUrl}`)
  }

  if (filter === `all` || filter === `static-query-data`) {
    assets.push(`/page-data/sq/d/${pageData.staticQueryHashes[0]}.json`)
  }

  return assets
}

export const blockResourcesUtils = {
  getAssetsForPage,
  getAssetsForChunk,
}
