import { processStaticQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"
import { IProgressReporter } from "gatsby-cli/lib/reporter/reporter-progress"

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

  let activity: IProgressReporter
  // TODO: This is hacky, remove with a refactor of PQR itself
  if (!process.env.GATSBY_EXPERIMENTAL_PARALLEL_QUERY_RUNNING) {
    activity = reporter.createProgress(
      `run static queries`,
      staticQueryIds.length,
      0,
      {
        id: `static-query-running`,
        parentSpan,
      }
    )
    activity.start()
  } else {
    activity = {
      span: parentSpan,
      tick: () => {},
      done: () => {},
    } as IProgressReporter
  }

  await processStaticQueries(staticQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  activity.done()
}
