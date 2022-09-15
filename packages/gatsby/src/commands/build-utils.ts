import fs from "fs-extra"
import path from "path"
import { platform } from "os"
import reporter from "gatsby-cli/lib/reporter"
import {
  remove as removePageHtmlFile,
  generateHtmlPath,
  fixedPagePath,
} from "gatsby-core-utils"
import { removePageData } from "../utils/page-data"
import { store } from "../redux"
import { IGatsbyState } from "../redux/types"
import { getPageMode } from "../utils/page-mode"

const checkFolderIsEmpty = (path: string): boolean =>
  fs.existsSync(path) && !fs.readdirSync(path).length

const checkAndRemoveEmptyDir = (publicDir: string, pagePath: string): void => {
  const pageHtmlDirectory = path.dirname(generateHtmlPath(publicDir, pagePath))
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

const FSisCaseInsensitive = process.env.TEST_FORCE_CASE_FS
  ? process.env.TEST_FORCE_CASE_FS === `INSENSITIVE`
  : platform() === `win32` || platform() === `darwin`
function normalizePagePath(path: string): string {
  if (path === `/`) {
    return `/`
  }

  if (FSisCaseInsensitive) {
    // e.g. /TEST/ and /test/ would produce "same" artifacts on case insensitive
    // file systems
    path = path.toLowerCase()
  }

  return path.endsWith(`/`) ? path.slice(0, -1) : path
}

type PageGenerationAction = "delete" | "regenerate" | "reuse"
const pageGenerationActionPriority: Record<PageGenerationAction, number> = {
  // higher the number, higher the priority
  regenerate: 2,
  reuse: 1,
  delete: 0,
}

export function calcDirtyHtmlFiles(state: IGatsbyState): {
  toRegenerate: Array<string>
  toDelete: Array<string>
  toCleanupFromTrackedState: Set<string>
} {
  const toRegenerate = new Set<string>()
  const toDelete = new Set<string>()
  const toCleanupFromTrackedState = new Set<string>()
  const normalizedPagePathToAction = new Map<
    string,
    {
      actualPath: string
      action: PageGenerationAction
    }
  >()

  /**
   * multiple page paths can result in same html and page-data filenames
   * so we need to keep that in mind when generating list of pages
   * to regenerate and more importantly - to delete (so we don't delete html and page-data file
   * when path changes slightly but it would still result in same html and page-data filenames
   * for example adding/removing trailing slash between builds or even mid build with plugins
   * like `gatsby-plugin-remove-trailing-slashes`). Additionally similar consideration need to
   * be accounted for cases where page paths casing on case-insensitive file systems.
   */
  function markActionForPage(path: string, action: PageGenerationAction): void {
    const normalizedPagePath = normalizePagePath(path)

    const previousAction = normalizedPagePathToAction.get(normalizedPagePath)
    let overwritePreviousAction = false
    if (previousAction) {
      const previousActionPriority =
        pageGenerationActionPriority[previousAction.action]
      const currentActionPriority = pageGenerationActionPriority[action]

      if (currentActionPriority > previousActionPriority) {
        overwritePreviousAction = true
        toCleanupFromTrackedState.add(previousAction.actualPath)
        if (previousAction.action === `delete`) {
          // "reuse" or "regenerate" will take over, so we should
          // remove path from list of paths to delete
          toDelete.delete(previousAction.actualPath)
        }
      }
    }

    if (!previousAction || overwritePreviousAction) {
      normalizedPagePathToAction.set(normalizedPagePath, {
        actualPath: path,
        action,
      })
      if (action === `delete`) {
        toDelete.add(path)
      } else if (action === `regenerate`) {
        toRegenerate.add(path)
      }
    }
  }

  if (state.html.unsafeBuiltinWasUsedInSSR) {
    reporter.warn(
      `Previous build used unsafe builtin method. We need to rebuild all pages`
    )
  }

  state.html.trackedHtmlFiles.forEach(function (htmlFile, path) {
    const page = state.pages.get(path)
    if (htmlFile.isDeleted || !page) {
      // FIXME: checking pages state here because pages are not persisted
      // and because of that `isDeleted` might not be set ...
      markActionForPage(path, `delete`)
    } else {
      if (getPageMode(page, state) === `SSG`) {
        if (htmlFile.dirty || state.html.unsafeBuiltinWasUsedInSSR) {
          markActionForPage(path, `regenerate`)
        } else {
          markActionForPage(path, `reuse`)
        }
      }
    }
  })

  return {
    toRegenerate: Array.from(toRegenerate),
    toDelete: Array.from(toDelete),
    toCleanupFromTrackedState,
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
  const dirtySlices = new Set<string>()
  for (const dirtyTemplate of dirtyTemplates) {
    const component = state.components.get(dirtyTemplate)
    if (component) {
      for (const page of component.pages) {
        if (component.isSlice) {
          dirtySlices.add(page)
        } else {
          dirtyPages.add(page)
        }
      }
    }
  }

  store.dispatch({
    type: `HTML_MARK_DIRTY_BECAUSE_STATIC_QUERY_RESULT_CHANGED`,
    payload: {
      pages: dirtyPages,
      slices: dirtySlices,
      staticQueryHashes: dirtyStaticQueryResults,
    },
  })
}
