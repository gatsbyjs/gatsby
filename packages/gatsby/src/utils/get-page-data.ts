import * as path from "path"
import { store, emitter } from "../redux"
import { IClearPendingPageDataWriteAction } from "../redux/types"
import {
  IPageDataWithQueryResult,
  readPageData as readPageDataUtil,
} from "./page-data"

const DEFAULT_WAIT_TIMEOUT = 15 * 1000
export const RETRY_INTERVAL = 5 * 1000

export async function getPageData(
  pagePath: string,
  waitForMS: number = DEFAULT_WAIT_TIMEOUT
): Promise<IPageDataWithQueryResult> {
  return doGetPageData(pagePath, waitForMS, waitForMS)
}

async function doGetPageData(
  pagePath: string,
  waitForMS: number,
  initialWaitForMs: number
): Promise<IPageDataWithQueryResult> {
  const { queries, pendingPageDataWrites, pages } = store.getState()

  if (!pages.has(pagePath)) {
    throw new Error(
      `Page "${pagePath}" doesn't exist. It might have been deleted recently.`
    )
  }

  if (process.env.GATSBY_EXPERIMENTAL_LAZY_DEVJS) {
    const { boundActionCreators } = require(`../redux/actions`)
    const { createClientVisitedPage } = boundActionCreators
    const page = pages.get(pagePath)
    // Listen for the client marking a page as visited (meaning we need to
    // compile its page component.
    const chunkCalls = new Set()
    if (page?.componentChunkName) {
      // Ignore all but the first POST.
      if (!chunkCalls.has(page.componentChunkName)) {
        // Tell Gatsby there's a new page component to trigger it
        // being added to the bundle.
        createClientVisitedPage(page.componentChunkName)

        // Tell Gatsby to rewrite the page data for the pages
        // owned by this component to update it to say that
        // its page component is now part of the dev bundle.
        // The pages will be rewritten after the webpack compilation
        // finishes.
        //
        // Set a timeout to ensure the webpack compile of the new page
        // component triggered above has time to go through.
        setTimeout(() => {
          // Find the component page for this componentChunkName.
          function getByChunkName(map, searchValue): void | string {
            for (const [key, value] of map.entries()) {
              if (value.componentChunkName === searchValue) return key
            }

            return undefined
          }
          const pageKey = getByChunkName(pages, page.componentChunkName)

          if (pageKey) {
            const page = pages.get(pageKey)
            if (page) {
              store.dispatch({
                type: `ADD_PENDING_TEMPLATE_DATA_WRITE`,
                payload: {
                  pages: [
                    {
                      componentPath: page.component,
                    },
                  ],
                },
              })
            }
          }
          chunkCalls.add(page.componentChunkName)
        }, 20)
      }
    }
  }

  const query = queries.trackedQueries.get(pagePath)

  if (!query) {
    throw new Error(`Could not find query ${pagePath}`)
  }
  if (query.running !== 0) {
    return waitNextPageData(pagePath, waitForMS, initialWaitForMs)
  }
  if (query.dirty !== 0) {
    emitter.emit(`QUERY_RUN_REQUESTED`, { pagePath })
    return waitNextPageData(pagePath, waitForMS, initialWaitForMs)
  }
  if (pendingPageDataWrites.pagePaths.has(pagePath)) {
    return waitNextPageData(pagePath, waitForMS, initialWaitForMs)
  }
  // Results are up-to-date
  return readPageData(pagePath)
}

async function waitNextPageData(
  pagePath: string,
  remainingTime: number,
  initialWaitForMs: number
): Promise<IPageDataWithQueryResult> {
  if (remainingTime > 0) {
    return new Promise(resolve => {
      emitter.on(`CLEAR_PENDING_PAGE_DATA_WRITE`, listener)

      const timeout = setTimeout((): void => {
        emitter.off(`CLEAR_PENDING_PAGE_DATA_WRITE`, listener)
        resolve(
          doGetPageData(
            pagePath,
            Math.max(remainingTime - RETRY_INTERVAL, 0),
            initialWaitForMs
          )
        )
      }, Math.min(RETRY_INTERVAL, remainingTime))

      function listener(data: IClearPendingPageDataWriteAction): void {
        if (data.payload.page === pagePath) {
          clearTimeout(timeout)
          emitter.off(`CLEAR_PENDING_PAGE_DATA_WRITE`, listener)
          resolve(readPageData(pagePath))
        }
      }
    })
  } else {
    // not ideal ... but try to push results we might have (stale)
    // or fail/reject
    return readPageData(pagePath).catch(() => {
      throw new Error(
        `Couldn't get query results for "${pagePath}" in ${(
          initialWaitForMs / 1000
        ).toFixed(3)}s.`
      )
    })
  }
}

async function readPageData(pagePath): Promise<IPageDataWithQueryResult> {
  const { program } = store.getState()

  try {
    return await readPageDataUtil(
      path.join(program.directory, `public`),
      pagePath
    )
  } catch (err) {
    throw new Error(
      `Error loading a result for the page query in "${pagePath}". Query was not run and no cached result was found.`
    )
  }
}
