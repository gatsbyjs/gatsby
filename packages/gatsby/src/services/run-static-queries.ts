import { processStaticQueries } from "../query"
import { IBuildContext } from "./"
import reporter from "gatsby-cli/lib/reporter"

export async function runStaticQueries({
  parentSpan,
  queryIds,
  store,
  program,
}: Partial<IBuildContext>): Promise<void> {
  if (!queryIds || !store) {
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

  activity.start()
  await processStaticQueries(staticQueryIds, {
    state,
    activity,
    graphqlTracing: program?.graphqlTracing,
  })

  activity.done()
}
