import { processPageQueries } from "../query"
const reporter = require(`gatsby-cli/lib/reporter`)

export async function runPageQueries({
  parentSpan,
  queryIds,
  store,
}): Promise<any> {
  const { pageQueryIds } = queryIds
  const state = store.getState()
  const pageQueryIdsCount = pageQueryIds.filter(id => state.pages.has(id))
    .length

  const activity = reporter.createProgress(
    `run page queries`,
    pageQueryIdsCount,
    0,
    {
      id: `static-query-running`,
      parentSpan,
    }
  )

  if (pageQueryIdsCount) {
    activity.start()
    await processPageQueries(pageQueryIds, { state, activity })
  }

  activity.done()
}
