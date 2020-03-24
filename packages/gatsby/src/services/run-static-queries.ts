import { processStaticQueries } from "../query"
const reporter = require(`gatsby-cli/lib/reporter`)

// eslint-disable-next-line consistent-return
export async function runStaticQueries({
  parentSpan,
  queryIds,
  store,
}): Promise<object> {
  let results = new Map()
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
    })
  }

  activity.done()
  return { results }
}
