import { processStaticQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"
import { createPageDependencyBatcher } from "../redux/actions/add-page-dependency"

export async function runStaticQueries({
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
  const { staticQueryIds } = queryIds
  if (!staticQueryIds.length) {
    return
  }

  const state = store.getState()
  const activity = reporter.createProgress(
    `run static queries`,
    staticQueryIds.length,
    0,
    {
      id: `static-query-running`,
      parentSpan,
    }
  )

  // TODO: This is hacky, remove with a refactor of PQR itself
  if (!process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    activity.start()
  }

  await processStaticQueries(staticQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  // at this point, we're done grabbing page dependencies, so we need to
  // flush out the batcher in case there are any left
  createPageDependencyBatcher.flush()

  if (!process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    activity.done()
  }
}
