import { calcDirtyQueryIds, groupQueryIds } from "../query"
import { IGroupedQueryIds } from "./"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"

export async function calculateDirtyQueries({
  store,
  websocketManager,
  currentlyHandledPendingQueryRuns,
}: Partial<IQueryRunningContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  assertStore(store)
  const state = store.getState()
  const queryIds = calcDirtyQueryIds(state)

  let queriesToRun: Array<string> = queryIds

  if (
    // eslint-disable-next-line
    false &&
    // disable this code path for now as it needs additional runtime changes
    // this is just to illustrate how `currentlyHandledPendingQueryRuns` would be handled
    process.env.gatsby_executing_command === `develop` &&
    process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND
  ) {
    // 404 are special cases in our runtime that ideally use
    // generic things to work, but for now they have special handling
    const pagePathFilter = new Set([`/404.html`, `/dev-404-page/`])

    // we want to make sure we run queries for pages that user currently
    // view in the browser
    if (websocketManager?.activePaths) {
      // @ts-ignore (this is just because this code is unreachable for now, but TS complains that `websocketManager` is possibly 'undefined')
      websocketManager.activePaths.forEach(
        pagePathFilter.add.bind(pagePathFilter)
      )
    }

    // we also want to make sure we include pages that were requested from
    // via `page-data` fetches or websocket requests
    if (currentlyHandledPendingQueryRuns) {
      // @ts-ignore (this is just because this code is unreachable for now, but TS complains that `currentlyHandledPendingQueryRuns` is possibly 'undefined')
      currentlyHandledPendingQueryRuns.forEach(
        pagePathFilter.add.bind(pagePathFilter)
      )
    }

    // static queries are also not on demand
    queriesToRun = queryIds.filter(
      queryId => queryId.startsWith(`sq--`) || pagePathFilter.has(queryId)
    )
  }

  return {
    queryIds: groupQueryIds(queriesToRun),
  }
}
