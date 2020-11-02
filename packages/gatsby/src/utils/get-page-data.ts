import * as path from "path"
import { store, emitter } from "../redux"
import {
  IPageDataWithQueryResult,
  readPageData as readPageDataUtil,
} from "./page-data"

export async function getPageData(
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const { queries } = store.getState()

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
  // Results are up-to-date
  return readPageData(pagePath)
}

async function waitNextPageData(
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  // FIXME: Relying on `CLEAR_PENDING_PAGE_DATA_WRITES` is wrong as we
  //  may see a previous query running here
  return new Promise(resolve => {
    const listener = (): void => {
      emitter.off(`CLEAR_PENDING_PAGE_DATA_WRITES`, listener)
      resolve(readPageData(pagePath))
    }
    emitter.on(`CLEAR_PENDING_PAGE_DATA_WRITES`, listener)
  })
}

function readPageData(pagePath): Promise<IPageDataWithQueryResult> {
  const { program } = store.getState()
  return readPageDataUtil(path.join(program.directory, `public`), pagePath)
}
