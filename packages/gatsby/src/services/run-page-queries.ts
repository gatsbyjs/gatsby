import { processPageQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"

export async function runPageQueries({
  parentSpan,
  queryIds,
  store,
  program,
  graphqlRunner,
}: Partial<IQueryRunningContext>): Promise<void> {
  assertStore(store)
  const state = store.getState()

  if (!queryIds) {
    return
  }

  const { pageQueryIds } = queryIds

  if (pageQueryIds.length === 0) {
    return
  }

  const activity = reporter.createProgress(
    `run page queries`,
    pageQueryIds.length,
    0,
    {
      id: `page-query-running`,
      parentSpan,
    }
  )

  // TODO: This is hacky, remove with a refactor of PQR itself
  if (!process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    activity.start()
  }

  await processPageQueries(pageQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  if (!process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    activity.done()
  }
}
