import { processStaticQueries } from "../query"
const reporter = require(`gatsby-cli/lib/reporter`)

export async function runStaticQueries({
  parentSpan,
  queryIds,
  store,
}): Promise<any> {
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
    await processStaticQueries(staticQueryIds, { state, activity })
  }

  activity.done()
}
