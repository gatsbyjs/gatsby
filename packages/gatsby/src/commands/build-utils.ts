import fs from "fs-extra"
import path from "path"

import {
  remove as removePageHtmlFile,
  getPageHtmlFilePath,
} from "../utils/page-html"
import { removePageData, fixedPagePath } from "../utils/page-data"
import { store } from "../redux"
import { IGatsbyState } from "../redux/types"

const checkFolderIsEmpty = (path: string): boolean =>
  fs.existsSync(path) && !fs.readdirSync(path).length

const checkAndRemoveEmptyDir = (publicDir: string, pagePath: string): void => {
  const pageHtmlDirectory = path.dirname(
    getPageHtmlFilePath(publicDir, pagePath)
  )
  const pageDataDirectory = path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath)
  )
  // if page's folder is empty also remove matching page-data folder
  if (checkFolderIsEmpty(pageHtmlDirectory)) {
    fs.removeSync(pageHtmlDirectory)
  }
  if (checkFolderIsEmpty(pageDataDirectory)) {
    fs.removeSync(pageDataDirectory)
  }
}

const sortedPageKeysByNestedLevel = (pageKeys: Array<string>): Array<string> =>
  pageKeys.sort((a, b) => {
    const currentPagePathValue = a.split(`/`).length
    const previousPagePathValue = b.split(`/`).length
    return previousPagePathValue - currentPagePathValue
  })

export const removePageFiles = async (
  publicDir: string,
  pageKeys: Array<string>
): Promise<void> => {
  const removePages = pageKeys.map(pagePath => {
    const removePromise = removePageHtmlFile({ publicDir }, pagePath)
    removePromise.then(() => {
      store.dispatch({
        type: `HTML_REMOVED`,
        payload: pagePath,
      })
    })
    return removePromise
  })

  const removePageDataList = pageKeys.map(pagePath =>
    removePageData(publicDir, pagePath)
  )

  return Promise.all([...removePages, ...removePageDataList]).then(() => {
    // Sort removed pageKeys by nested directories and remove if empty.
    sortedPageKeysByNestedLevel(pageKeys).forEach(pagePath => {
      checkAndRemoveEmptyDir(publicDir, pagePath)
    })
  })
}

export function calcDirtyHtmlFiles(
  state: IGatsbyState
): { toRegenerate: Array<string>; toDelete: Array<string> } {
  const toRegenerate: Array<string> = []
  const toDelete: Array<string> = []

  state.html.trackedHtmlFiles.forEach(function (htmlFile, path) {
    if (htmlFile.isDeleted || !state.pages.has(path)) {
      // FIXME: checking pages state here because pages are not persisted
      // and because of that `isDeleted` might not be set ...
      toDelete.push(path)
    } else if (htmlFile.dirty) {
      toRegenerate.push(path)
    }
  })

  return {
    toRegenerate,
    toDelete,
  }
}

export function markHtmlDirtyIfResultOfUsedStaticQueryChanged(): void {
  const state = store.getState()

  const dirtyStaticQueryResults = new Set<string>()
  state.html.trackedStaticQueryResults.forEach(function (
    staticQueryResultState,
    staticQueryHash
  ) {
    if (staticQueryResultState.dirty) {
      dirtyStaticQueryResults.add(staticQueryHash)
    }
  })

  // we have dirty static query hashes - now we need to find templates that use them
  const dirtyTemplates = new Set<string>()
  state.staticQueriesByTemplate.forEach(function (
    staticQueryHashes,
    componentPath
  ) {
    for (const dirtyStaticQueryHash of dirtyStaticQueryResults) {
      if (staticQueryHashes.includes(dirtyStaticQueryHash)) {
        dirtyTemplates.add(componentPath)
        break // we already know this template need to rebuild, no need to check rest of queries
      }
    }
  })

  // mark html as dirty
  const dirtyPages = new Set<string>()
  for (const dirtyTemplate of dirtyTemplates) {
    const component = state.components.get(dirtyTemplate)
    if (component) {
      for (const page of component.pages) {
        dirtyPages.add(page)
      }
    }
  }

  store.dispatch({
    type: `HTML_MARK_DIRTY_BECAUSE_STATIC_QUERY_RESULT_CHANGED`,
    payload: {
      pages: dirtyPages,
      staticQueryHashes: dirtyStaticQueryResults,
    },
  })
}
