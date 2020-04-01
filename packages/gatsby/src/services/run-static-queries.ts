import { processStaticQueries } from "../query"
import { IBuildContext } from "../state-machines/develop"
const reporter = require(`gatsby-cli/lib/reporter`)

export async function runStaticQueries({
  parentSpan,
  queryIds,
  store,
}: IBuildContext): Promise<object> {
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
    })
  }

  activity.done()
  return { results }
}
