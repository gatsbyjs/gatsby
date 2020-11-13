import * as path from "path"
import { store, emitter } from "../redux"
import { IClearPendingPageDataWriteAction } from "../redux/types"
import {
  IPageDataWithQueryResult,
  readPageData as readPageDataUtil,
} from "./page-data"

export async function getPageData(
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const { queries, pendingPageDataWrites } = store.getState()

  const query = queries.trackedQueries.get(pagePath)

  if (!query) {
    throw new Error(`Could not find query ${pagePath}`)
  }
  if (query.running !== 0) {
    return waitNextPageData(pagePath)
  }
  if (query.dirty !== 0) {
    emitter.emit(`QUERY_RUN_REQUESTED`, { pagePath })
    return waitNextPageData(pagePath)
  }
  if (pendingPageDataWrites.pagePaths.has(pagePath)) {
    return waitNextPageData(pagePath)
  }
  // Results are up-to-date
  return readPageData(pagePath)
}

async function waitNextPageData(
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  return new Promise(resolve => {
    const listener = (data: IClearPendingPageDataWriteAction): void => {
      if (data.payload.page === pagePath) {
        emitter.off(`CLEAR_PENDING_PAGE_DATA_WRITE`, listener)
        resolve(readPageData(pagePath))
      }
    }
    emitter.on(`CLEAR_PENDING_PAGE_DATA_WRITE`, listener)
  })
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
