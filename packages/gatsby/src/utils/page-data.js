const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)
const { chunk, isEqual } = require(`lodash`)

const { readFromCache } = require(`../redux/persist.js`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}
const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result, webpackCompilationHash) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    webpackCompilationHash,
    result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

const updateCompilationHashes = (
  { publicDir, workerPool },
  pagePaths,
  webpackCompilationHash
) => {
  const segments = chunk(pagePaths, 50)
  return Promise.map(segments, segment =>
    workerPool.updateCompilationHashes(
      { publicDir },
      segment,
      webpackCompilationHash
    )
  )
}

const getNewPageKeys = store =>
  new Promise(resolve => {
    const newPageKeys = []
    const newPageData = store.getState()
    const previousPageData = readFromCache()

    newPageData.pages.forEach((value, key) => {
      if (!previousPageData.pages.has(key)) {
        newPageKeys.push(key)
      } else {
        const newPageContext = value.context.page
        const previousPageContext = previousPageData.pages.get(key).context.page

        if (!isEqual(newPageContext, previousPageContext)) {
          newPageKeys.push(key)
        }
      }
    })

    resolve(newPageKeys)
  })

const removePreviousPageData = (directory, store) =>
  new Promise(resolve => {
    const newPageDataMap = store.getState()
    const previousPageDataMap = readFromCache()
    const deletedKeys = []

    previousPageDataMap.pages.forEach((value, key) => {
      if (!newPageDataMap.pages.has(key)) {
        deletedKeys.push(key)
        fs.removeSync(`${directory}/public${key}`)
        fs.removeSync(`${directory}/public/page-data${key}`)
      }
    })

    resolve(deletedKeys)
  })

module.exports = {
  read,
  write,
  updateCompilationHashes,
  getNewPageKeys,
  removePreviousPageData,
}
