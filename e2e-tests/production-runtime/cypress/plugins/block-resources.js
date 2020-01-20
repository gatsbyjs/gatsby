const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)

const publicDir = path.join(__dirname, `..`, `..`, `public`)

const getAssetManifest = () => {
  const { assetsByChunkName } = require(`${publicDir}/webpack.stats.json`)
  return assetsByChunkName
}

const moveAsset = (from, to) => {
  const fromExists = fs.existsSync(from)
  const toExists = fs.existsSync(to)

  if (fromExists && !toExists) {
    fs.moveSync(from, to, {
      overwrite: true,
    })
  }
}

const getAssetPath = assetFileName => path.join(publicDir, assetFileName)
const getHiddenAssetPath = assetFileName => getAssetPath(`_${assetFileName}`)

const restoreAsset = assetFileName => {
  moveAsset(getHiddenAssetPath(assetFileName), getAssetPath(assetFileName))
}

const blockAsset = assetFileName => {
  moveAsset(getAssetPath(assetFileName), getHiddenAssetPath(assetFileName))
}

const blockAssetsForChunk = ({ chunk, filter }) => {
  const assetManifest = getAssetManifest()
  assetManifest[chunk].forEach(blockAsset)
  console.log(`Blocked assets for chunk "${chunk}"`)
  return null
}

const restorePageData = hiddenPath => {
  if (path.basename(hiddenPath).charAt(0) !== `_`) {
    throw new Error(`hiddenPath should have _ prefix`)
  }
  const restoredPath = path.join(
    path.dirname(hiddenPath),
    path.basename(hiddenPath).slice(1)
  )
  moveAsset(hiddenPath, restoredPath)
}

const getPageDataPath = pagePath => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}

const getHiddenPageDataPath = pagePath => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `_page-data.json`)
}

const blockPageData = pagePath =>
  moveAsset(getPageDataPath(pagePath), getHiddenPageDataPath(pagePath))

const filterAssets = (assetsForPath, filter) =>
  assetsForPath.filter(asset => {
    if (filter === `all`) {
      return true
    } else if (filter === `page-data`) {
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

const blockAssetsForPage = ({ pagePath, filter }) => {
  const assetManifest = getAssetManifest()

  const pageData = JSON.parse(fs.readFileSync(getPageDataPath(pagePath)))
  const { componentChunkName } = pageData
  const assetsForPath = assetManifest[componentChunkName]

  const assets = filterAssets(assetsForPath, filter)
  assets.forEach(blockAsset)

  if (filter === `all` || filter === `page-data`) {
    blockPageData(pagePath)
  }

  console.log(`Blocked assets for path "${pagePath}" [${filter}]`)
  return null
}

const restore = () => {
  const allAssets = Object.values(getAssetManifest()).reduce((acc, assets) => {
    assets.forEach(asset => acc.add(asset))
    return acc
  }, new Set())

  allAssets.forEach(restoreAsset)

  const globPattern = path.join(publicDir, `/page-data/**`, `_page-data.json`)
  const hiddenPageDatas = glob.sync(globPattern)
  hiddenPageDatas.forEach(restorePageData)

  console.log(`Restored resources`)
  return null
}

module.exports = {
  restoreAllBlockedResources: restore,
  blockAssetsForChunk,
  blockAssetsForPage,
}
