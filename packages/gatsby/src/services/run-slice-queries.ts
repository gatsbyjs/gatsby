import { processSliceQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"

export async function runSliceQueries({
  parentSpan,
  queryIds,
  store,
  program,
  graphqlRunner,
}: Partial<IQueryRunningContext>): Promise<void> {
  assertStore(store)

  if (!queryIds) {
    return
  }
  const { sliceQueryIds } = queryIds
  if (!sliceQueryIds.length) {
    return
  }

  const state = store.getState()
  const activity = reporter.createProgress(
    `run slice queries`,
    sliceQueryIds.length,
    0,
    {
      id: `slice-query-running`,
      parentSpan,
    }
  )

  activity.start()

  await processSliceQueries(sliceQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  activity.done()
}
