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
          // page-data was flushed, but we don't know if query wasn't marked as stale in meantime
          // so we call `doGetPageData` again that will make checks and wait for fresh result
          // or resolve immediately if it's not stale.
          // Remaining time change is not actually "correct", but timeout overall is meant to ensure
          // we do resolve (or reject) eventually, it doesn't have to be 100% correct - we do decrease
          // it slightly to not end up in infinite loop situations.
          // We also need to delay calling `doGetPageData` because it can cause adding another `CLEAR_PENDING_PAGE_DATA_WRITE`
          // callback in same tick and `mett` will run this callback (because it will happen before current callback finishes
          // and `mett` doesn't guarantee it will only run callbacks registered before message was emitted)
          process.nextTick(() =>
            resolve(
              doGetPageData(
                pagePath,
                Math.max(remainingTime - RETRY_INTERVAL / 5, 0),
                initialWaitForMs
              )
            )
          )
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
