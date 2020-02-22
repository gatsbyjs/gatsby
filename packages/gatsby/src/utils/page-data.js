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
    state.pageData.forEach((resultHash, key) => {
      if (!cachedPageData.has(key)) {
        pageKeys.push(key)
      } else {
        const newPageDataHash = resultHash
        const previousPageDataHash = cachedPageData.get(key)

        if (newPageDataHash !== previousPageDataHash) {
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

const checkAndRemoveEmptyDir = (dir, pagePath) => {
  const hasFiles = fs.readdirSync(path.join(dir, pagePath), `utf8`, true)
  if (!hasFiles.length) {
    fs.removeSync(path.join(dir, pagePath))
  }
}

const removePageFiles = ({ publicDir }, pageKeys) => {
  const removePages = pageKeys.map(pagePath => {
    const pageHtmlFile = getFilePath({ publicDir }, pagePath, `html`)
    return fs
      .remove(pageHtmlFile)
      .then(() => checkAndRemoveEmptyDir(publicDir, pagePath))
  })

  const removePageData = pageKeys.map(pagePath => {
    const pageDataFile = getFilePath({ publicDir }, pagePath)
    return fs
      .remove(pageDataFile)
      .then(() =>
        checkAndRemoveEmptyDir(path.join(publicDir, `page-data`), pagePath)
      )
  })

  return Promise.all([...removePages, ...removePageData])
}

module.exports = {
  read,
  write,
  getChangedPageDataKeys,
  collectRemovedPageData,
  removePageFiles,
}
