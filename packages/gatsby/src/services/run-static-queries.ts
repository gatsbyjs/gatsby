import { processStaticQueries } from "../query"
import { IBuildContext } from "./"
import reporter from "gatsby-cli/lib/reporter"

export async function runStaticQueries({
  parentSpan,
  queryIds,
  store,
  program,
}: Partial<IBuildContext>): Promise<object> {
  let results = new Map()
  if (!queryIds || !store) {
    return { results: [] }
  }
  const { staticQueryIds } = queryIds
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

  if (staticQueryIds.length) {
    activity.start()
    results = await processStaticQueries(staticQueryIds, {
      state,
      activity,
      graphqlTracing: program?.graphqlTracing,
    })
  }

  activity.done()
  return { results }
}
