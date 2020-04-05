import fs from "fs-extra"
import path from "path"

import {
  remove as removePageHtmlFile,
  getPageHtmlFilePath,
} from "../utils/page-html"
import { remove as removePageDataFile, fixedPagePath } from "../utils/page-data"
import { IGatsbyState } from "../redux/types"

export const getChangedPageDataKeys = (
  state: IGatsbyState,
  cachedPageData: Map<string, string>
): string[] => {
  if (cachedPageData && state.pageData) {
    const pageKeys: string[] = []
    state.pageData.forEach((newPageDataHash: string, key: string) => {
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

export const collectRemovedPageData = (
  state: IGatsbyState,
  cachedPageData: Map<string, string>
): string[] => {
  if (cachedPageData && state.pageData) {
    const deletedPageKeys: string[] = []
    cachedPageData.forEach((_value: string, key: string) => {
      if (!state.pageData.has(key)) {
        deletedPageKeys.push(key)
      }
    })
    return deletedPageKeys
  }
  return []
}

const checkAndRemoveEmptyDir = (publicDir: string, pagePath: string): void => {
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

const sortedPageKeysByNestedLevel = (pageKeys: string[]): string[] =>
  pageKeys.sort((a, b) => {
    const currentPagePathValue = a.split(`/`).length
    const previousPagePathValue = b.split(`/`).length
    return previousPagePathValue - currentPagePathValue
  })

export const removePageFiles = async (
  publicDir: string,
  pageKeys: string[]
): Promise<void> => {
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
