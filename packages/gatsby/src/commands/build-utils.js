const fs = require(`fs-extra`)
const path = require(`path`)
import {
  remove as removePageHtmlFile,
  getPageHtmlFilePath,
} from "../utils/page-html"
const {
  remove: removePageDataFile,
  fixedPagePath,
} = require(`../utils/page-data`)

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
  const pageHtmlDirectory = path.dirname(
    getPageHtmlFilePath(publicDir, pagePath)
  )
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
    removePageHtmlFile({ publicDir }, pagePath)
  )

  const removePageData = pageKeys.map(pagePath =>
    removePageDataFile({ publicDir }, pagePath)
  )

  return Promise.all([...removePages, ...removePageData]).then(() => {
    // Sort removed pageKeys by nested directories and remove if empty.
    sortedPageKeysByNestedLevel(pageKeys).forEach(pagePath => {
      checkAndRemoveEmptyDir(publicDir, pagePath)
    })
  })
}

module.exports = {
  getChangedPageDataKeys,
  collectRemovedPageData,
  removePageFiles,
}
