const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)
const { remove: removeHtml } = require(`../utils/page-html`)

const fixedPagePath = pagePath => (pagePath === `/` ? `index` : pagePath)

const getFilePath = ({ publicDir }, pagePath) =>
  path.join(publicDir, `page-data`, fixedPagePath(pagePath), `page-data.json`)

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const remove = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  return fs.remove(filePath)
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

const checkAndRemoveEmptyDir = (publicDir, pagePath) => {
  const pageHtmlDirectory = path.join(publicDir, pagePath)
  const pageDataDirectory = path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath)
  )
  const hasFiles = fs.readdirSync(pageHtmlDirectory)

  // if page's html folder is empty also remove matching page-data folder
  if (!hasFiles.length) {
    fs.removeSync(pageHtmlDirectory)
    fs.removeSync(pageDataDirectory)
  }
}

const sortedPageKeysByNestedLevel = pageKeys =>
  pageKeys.sort((a, b) => {
    const currentPagePathValue = a.split(`/`).length
    const previousPagePathValue = b.split(`/`).length
    return previousPagePathValue - currentPagePathValue
  })

const removePageFiles = ({ publicDir }, pageKeys) => {
  const removePages = pageKeys.map(pagePath =>
    removeHtml({ publicDir }, pagePath)
  )

  const removePageData = pageKeys.map(pagePath =>
    remove({ publicDir }, pagePath)
  )

  return Promise.all([...removePages, ...removePageData]).then(() => {
    // Sort removed pageKeys by nested directories and remove if empty.
    sortedPageKeysByNestedLevel(pageKeys).forEach(pagePath => {
      checkAndRemoveEmptyDir(publicDir, pagePath)
    })
  })
}

module.exports = {
  read,
  write,
  remove,
  getChangedPageDataKeys,
  collectRemovedPageData,
  removePageFiles,
}
