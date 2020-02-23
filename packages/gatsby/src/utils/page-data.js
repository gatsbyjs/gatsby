const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)
const { generateHtmlPathToOutput } = require(`../utils/page-html`)

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

const getChangedPageDataKeys = (state, cachedPageData) => {
  if (cachedPageData && state.pageData) {
    const pageKeys = []
    state.pageData.forEach((newPageDataHash, key) => {
      if (!cachedPageData.has(key)) {
        pageKeys.push(key)
      } else {
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
  const directory = path.join(dir, pagePath)
  const hasFiles = fs.readdirSync(directory)
  if (!hasFiles.length) {
    fs.removeSync(directory)
  }
}

const sortedPageKeysByNestedLevel = pageKeys =>
  pageKeys.sort((a, b) => {
    const currentPathPathValue = a.split(`/`).length
    const previousPathPathValue = b.split(`/`).length
    if (currentPathPathValue > previousPathPathValue) {
      return -1
    }
    if (currentPathPathValue < previousPathPathValue) {
      return 1
    }
    return 0
  })

const removePageFiles = ({ publicDir }, pageKeys) => {
  const removePages = pageKeys.map(pagePath => {
    const pageHtmlFile = generateHtmlPathToOutput(publicDir, pagePath)
    return fs.remove(pageHtmlFile)
  })

  const removePageData = pageKeys.map(pagePath => {
    const pageDataFile = getFilePath({ publicDir }, pagePath)
    return fs.remove(pageDataFile)
  })

  return Promise.all([...removePages, ...removePageData]).then(() => {
    sortedPageKeysByNestedLevel(pageKeys).forEach(pagePath => {
      checkAndRemoveEmptyDir(publicDir, pagePath)
      checkAndRemoveEmptyDir(`${publicDir}/page-data`, pagePath)
    })
  })
}

module.exports = {
  read,
  write,
  getChangedPageDataKeys,
  collectRemovedPageData,
  removePageFiles,
}
