const fs = require(`fs-extra`)
const path = require(`path`)
const yargs = require(`yargs`)

const getAssetManifest = () => {
  const { assetsByChunkName } = require(`../public/webpack.stats.json`)
  return assetsByChunkName
}

const getPagesManifest = () => {
  const { pages, dataPaths } = require(`../.cache/data.json`)

  return pages.reduce((result, page) => {
    result[page.path] = {
      componentChunkName: page.componentChunkName,
      queryResult: dataPaths[page.jsonName],
    }
    return result
  }, {})
}

const getAssetPath = assetFileName =>
  path.join(__dirname, `..`, `public`, assetFileName)
const getHiddenAssetPath = assetFileName => getAssetPath(`_${assetFileName}`)

const getQueryResultPath = queryResultFileName =>
  path.join(
    __dirname,
    `..`,
    `public`,
    `static`,
    `d`,
    `${queryResultFileName}.json`
  )
const getHiddenQueryResultPath = queryResultFileName =>
  getQueryResultPath(`_${queryResultFileName}`)

const moveAsset = (from, to) => {
  const fromExists = fs.existsSync(from)
  const toExists = fs.existsSync(to)

  if (fromExists && !toExists) {
    fs.moveSync(from, to, {
      overwrite: true,
    })
  }
}

const blockQueryResult = queryResultFileName => {
  moveAsset(
    getQueryResultPath(queryResultFileName),
    getHiddenQueryResultPath(queryResultFileName)
  )
}

const restoreQueryResult = queryResultFileName => {
  moveAsset(
    getHiddenQueryResultPath(queryResultFileName),
    getQueryResultPath(queryResultFileName)
  )
}

const blockAsset = assetFileName => {
  moveAsset(getAssetPath(assetFileName), getHiddenAssetPath(assetFileName))
}

const restoreAsset = assetFileName => {
  moveAsset(getHiddenAssetPath(assetFileName), getAssetPath(assetFileName))
}

const blockAssetsForChunk = ({ chunk, filter }) => {
  const assetManifest = getAssetManifest()
  assetManifest[chunk].forEach(blockAsset)
  console.log(`Blocked assets for chunk "${chunk}"`)
}

const filterAssets = (assetsForPath, filter) =>
  assetsForPath.filter(asset => {
    if (filter === `all`) {
      return true
    } else if (filter === `query-result`) {
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

const blockAssetsForPath = ({ page, filter }) => {
  const pagesManifest = getPagesManifest()
  const assetManifest = getAssetManifest()

  const { componentChunkName, queryResult } = pagesManifest[page]
  const assetsForPath = assetManifest[componentChunkName]

  const assets = filterAssets(assetsForPath, filter)
  assets.forEach(blockAsset)

  if (filter === `all` || filter === `query-result`) {
    blockQueryResult(queryResult)
  }

  console.log(`Blocked assets for path "${page}" [${filter}]`)
}

const restore = () => {
  const allAssets = Object.values(getAssetManifest()).reduce((acc, assets) => {
    assets.forEach(asset => acc.add(asset))
    return acc
  }, new Set())

  allAssets.forEach(restoreAsset)

  Object.values(getPagesManifest())
    .map(page => page.queryResult)
    .forEach(restoreQueryResult)

  console.log(`Restored resources`)
}

yargs
  .command(
    `block <chunk>`,
    `Block assets for given chunk`,
    yargs =>
      yargs.positional(`chunk`, {
        describe: `Name of the chunk`,
        type: `string`,
      }),
    blockAssetsForChunk
  )
  .command(
    `block-page <page> [<filter>]`,
    `Block assets for a template page used by given path`,
    yargs =>
      yargs
        .positional(`page`, {
          describe: `Path to a page`,
          type: `string`,
        })
        .positional(`filter`, {
          describe: `Type of chunks associated with page`,
          type: `string`,
          choices: [`all`, `page-template`, `extra`, `query-result`],
          default: `all`,
        }),
    blockAssetsForPath
  )
  .command(`restore`, `Restore all the assets`, restore).argv
