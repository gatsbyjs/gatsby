const fs = require(`fs-extra`)
const path = require(`path`)
const { fixedPagePath } = require(`gatsby-core-utils`)
const publicDir = path.join(__dirname, `..`, `..`, `public`)

function getAssetManifest() {
  const { assetsByChunkName } = require(`${publicDir}/webpack.stats.json`)
  return assetsByChunkName
}

function getPageDataPath(pagePath) {
  return path.posix.join(`page-data`, fixedPagePath(pagePath), `page-data.json`)
}

const filterAssets = (assetsForPath, filter) => {
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

function getAssetsForChunk({ filter }) {
  const assetManifest = getAssetManifest()

  return assetManifest[filter].map(asset => `/${asset}`)
}

function getAssetsForPage({ pagePath, filter }) {
  const assetManifest = getAssetManifest()

  const pageDataUrl = getPageDataPath(pagePath)
  const pageData = JSON.parse(
    fs.readFileSync(path.join(publicDir, pageDataUrl))
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

module.exports = {
  getAssetsForPage,
  getAssetsForChunk,
}
