import * as path from "path"
import { store, emitter } from "../redux"
import * as actions from "../redux/actions/internal"
import {
  IPageDataWithQueryResult,
  readPageData as readPageDataUtil,
} from "./page-data"

export interface IPageQueryResult {
  id: string
  result: IPageDataWithQueryResult
}

export async function getPageData(pagePath: string): Promise<IPageQueryResult> {
  const { queries } = store.getState()

  const query = queries.trackedQueries.get(pagePath)

  if (!query) {
    throw new Error(`Could not find query ${pagePath}`)
  }
  if (query.running !== 0) {
    return waitNextPageData(pagePath)
  }
  if (query.dirty !== 0) {
    store.dispatch(actions.queryRunRequested({ path: pagePath, isPage: true }))
    return waitNextPageData(pagePath)
  }
  // Results are up-to-date
  return readPageData(pagePath)
}

async function waitNextPageData(pagePath: string): Promise<IPageQueryResult> {
  return new Promise(resolve => {
    const listener = (): void => {
      emitter.off(`CLEAR_PENDING_PAGE_DATA_WRITES`, listener)
      resolve(readPageData(pagePath))
    }
    emitter.on(`CLEAR_PENDING_PAGE_DATA_WRITES`, listener)
  })
}

async function readPageData(pagePath): Promise<IPageQueryResult> {
  const { program } = store.getState()
  const tmp = {
    id: pagePath,
    result: await readPageDataUtil(
      path.join(program.directory, `public`),
      pagePath
    ),
  }
  return tmp
}
