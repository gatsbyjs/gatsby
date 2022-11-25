// this is partial copy of e2e-tests/production-runtime/cypress/plugins/block-resources.js
// partial because there is no asset blocking possibly in develop (we have single, virtual development bundle)

const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)
const { fixedPagePath } = require(`gatsby-core-utils`)

const siteDir = path.join(__dirname, `..`, `..`)
const srcDir = path.join(siteDir, `src`)
const publicDir = path.join(siteDir, `public`)

const moveAsset = (from, to) => {
  const fromExists = fs.existsSync(from)
  const toExists = fs.existsSync(to)

  if (fromExists && !toExists) {
    fs.moveSync(from, to, {
      overwrite: true,
    })
  }
}

const restoreAsset = hiddenPath => {
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
  return path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `page-data.json`
  )
}

const getHiddenPageDataPath = pagePath => {
  return path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `_page-data.json`
  )
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

function blockPageComponent({ path: pageComponentPath }) {
  const hiddenPath = path.join(
    path.dirname(pageComponentPath),
    `_` + path.basename(pageComponentPath)
  )

  moveAsset(path.join(srcDir, pageComponentPath), path.join(srcDir, hiddenPath))
  return null
}

const restore = () => {
  const hiddenPageDataGlobPattern = path.join(
    publicDir,
    `/page-data/**`,
    `_page-data.json`
  )
  const hiddenPageDatas = glob.sync(hiddenPageDataGlobPattern)
  hiddenPageDatas.forEach(restoreAsset)

  const hiddenPageComponentGlobPattern = path.join(srcDir, `**`, `_*`)
  const hiddenPageComponents = glob.sync(hiddenPageComponentGlobPattern)
  hiddenPageComponents.forEach(restoreAsset)

  console.log(`Restored resources`)
  return null
}

module.exports = {
  restoreAllBlockedResources: restore,
  blockAssetsForPage,
  blockPageComponent,
}
