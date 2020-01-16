const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)
const Promise = require(`bluebird`)
const newPageKeys = []

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}
const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    result,
  }
  const bodyStr = JSON.stringify(body)
  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(bodyStr) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      filePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(filePath, bodyStr)
}

const getNewPageKeys = (store, cacheData) =>
  new Promise(resolve => {
    if (newPageKeys.length) {
      resolve(newPageKeys)
      return
    }

    if (cacheData.pages) {
      store.pages.forEach((value, key) => {
        if (!cacheData.pages.has(key)) {
          newPageKeys.push(key)
        } else {
          const newPageContext = JSON.stringify(value.context)
          const previousPageContext = JSON.stringify(
            cacheData.pages.get(key).context
          )

          if (newPageContext !== previousPageContext) {
            newPageKeys.push(key)
          }
        }
      })
      resolve(newPageKeys)
      return
    }

    resolve([...store.pages.keys()])
  })

const removePreviousPageData = (directory, store, cacheData) =>
  new Promise(resolve => {
    const deletedKeys = []
    if (cacheData.pages) {
      cacheData.pages.forEach((value, key) => {
        if (!store.pages.has(key)) {
          deletedKeys.push(key)
          fs.removeSync(`${directory}/public${key}`)
          fs.removeSync(`${directory}/public/page-data${key}`)
        }
      })
    }
    resolve(deletedKeys)
  })

module.exports = {
  read,
  write,
  getNewPageKeys,
  removePreviousPageData,
}
