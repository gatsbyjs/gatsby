const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)
const { chunk, isEqual, size } = require(`lodash`)

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

const getNewPageKeys = (store, cacheData) =>
  new Promise(resolve => {
    const newPageKeys = []

    store.pages.forEach((value, key) => {
      if (!cacheData.pages.has(key)) {
        newPageKeys.push(key)
      } else {
        const newPageContext = value.context.page
        const previousPageContext = cacheData.pages.get(key).context.page

        if (!isEqual(newPageContext, previousPageContext)) {
          newPageKeys.push(key)
        }
      }
    })

    resolve(newPageKeys)
  })

const removePreviousPageData = (directory, store, cacheData) =>
  new Promise(resolve => {
    const deletedKeys = []

    cacheData.pages.forEach((value, key) => {
      if (!store.pages.has(key)) {
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
