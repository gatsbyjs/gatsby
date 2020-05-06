// this is partial copy of e2e-tests/production-runtime/cypress/plugins/block-resources.js
// partial because there is no asset blocking possibly in develop (we have single, virtual development bundle)

const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)

const publicDir = path.join(__dirname, `..`, `..`, `public`)

const moveAsset = (from, to) => {
  const fromExists = fs.existsSync(from)
  const toExists = fs.existsSync(to)

  if (fromExists && !toExists) {
    fs.moveSync(from, to, {
      overwrite: true,
    })
  }
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

const blockAssetsForPage = ({ pagePath, filter }) => {
  if (filter === `all` || filter === `page-data`) {
    blockPageData(pagePath)
  }

  console.log(`Blocked assets for path "${pagePath}" [${filter}]`)
  return null
}

const restore = () => {
  const globPattern = path.join(publicDir, `/page-data/**`, `_page-data.json`)
  const hiddenPageDatas = glob.sync(globPattern)
  hiddenPageDatas.forEach(restorePageData)

  console.log(`Restored resources`)
  return null
}

module.exports = {
  restoreAllBlockedResources: restore,
  blockAssetsForPage,
}
