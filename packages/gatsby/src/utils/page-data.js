const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)

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

const getChangedPageDataKeys = (store, cacheData) => {
  if (cacheData.webpackCompilationHash !== store.webpackCompilationHash) {
    return [...store.pages.keys()]
  }
  if (cacheData.pageData && store.pageData) {
    const pageKeys = []
    store.pageData.forEach((value, key) => {
      if (!cacheData.pageData.has(key)) {
        pageKeys.push(key)
      } else {
        const newPageData = JSON.stringify(value)
        const previousPageData = JSON.stringify(cacheData.pageData.get(key))

        if (newPageData !== previousPageData) {
          pageKeys.push(key)
        }
      }
    })
    return pageKeys
  }

  return [...store.pages.keys()]
}

const removePreviousPageData = (store, cacheData) => {
  if (cacheData.pageData && store.pageData) {
    const deletedPageKeys = []
    cacheData.pageData.forEach((_value, key) => {
      if (!store.pageData.has(key)) {
        deletedPageKeys.push(key)
      }
    })
    return deletedPageKeys
  }
  return []
}

module.exports = {
  read,
  write,
  getChangedPageDataKeys,
  removePreviousPageData,
}
