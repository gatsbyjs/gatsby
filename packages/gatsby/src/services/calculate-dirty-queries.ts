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
  const queryIds: Array<string> = calcDirtyQueryIds(state)

  let queriesToRun = queryIds

  if (
    process.env.gatsby_executing_command === `develop` &&
    process.env.GATSBY_QUERY_ON_DEMAND
  ) {
    // 404 are special cases in our runtime that ideally use
    // generic things to work, but for now they have special handling
    const pagePathFilter = new Set([`/404.html`, `/dev-404-page/`])

    // we want to make sure we run queries for pages that user currently
    // view in the browser
    if (websocketManager?.activePaths) {
      for (const activePath of websocketManager.activePaths) {
        pagePathFilter.add(activePath)
      }
    }

    // we also want to make sure we include pages that were requested from
    // via `page-data` fetches or websocket requests
    if (currentlyHandledPendingQueryRuns) {
      for (const pendingQuery of currentlyHandledPendingQueryRuns) {
        pagePathFilter.add(pendingQuery)
      }
    }

    // static and slice queries are also not on demand
    queriesToRun = queryIds.filter(
      queryId =>
        queryId.startsWith(`sq--`) ||
        queryId.startsWith(`slice--`) ||
        pagePathFilter.has(queryId)
    )
  }

  return {
    queryIds: groupQueryIds(queriesToRun),
  }
}
