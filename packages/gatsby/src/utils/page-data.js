const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)

const getFilePath = ({ publicDir }, pagePath, type) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  if (type === `html`) {
    return path.join(publicDir, fixedPagePath, `index.html`)
  }
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

const getChangedPageDataKeys = (state, cachedPageData) => {
  if (cachedPageData && state.pageData) {
    const pageKeys = []
    state.pageData.forEach((value, key) => {
      if (!cachedPageData.has(key)) {
        pageKeys.push(key)
      } else {
        const newPageData = JSON.stringify(value)
        const previousPageData = JSON.stringify(cachedPageData.get(key))

        if (newPageData !== previousPageData) {
          pageKeys.push(key)
        }
      }
    })
    return pageKeys
  }

  return [...state.pages.keys()]
}

const collectRemovedPageData = (state, cachedPageData) => {
  if (cachedPageData && state.pageData) {
    const deletedPageKeys = []
    cachedPageData.forEach((_value, key) => {
      if (!state.pageData.has(key)) {
        deletedPageKeys.push(key)
      }
    })
    return deletedPageKeys
  }
  return []
}

const removePageFiles = ({ publicDir }, pageKeys) => {
  const removePages = pageKeys.map(value => {
    const pageHtml = getFilePath({ publicDir }, value, `html`)
    return fs.remove(pageHtml)
  })

  const removePagesData = pageKeys.map(value => {
    const pageData = getFilePath({ publicDir }, value)
    return fs.remove(pageData)
  })

  return Promise.all([...removePages, ...removePagesData])
}

module.exports = {
  read,
  write,
  getChangedPageDataKeys,
  collectRemovedPageData,
  removePageFiles,
}
