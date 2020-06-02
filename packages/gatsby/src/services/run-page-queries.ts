import { processPageQueries } from "../query"
import { IBuildContext } from "./"
import reporter from "gatsby-cli/lib/reporter"

export async function runPageQueries({
  parentSpan,
  queryIds,
  store,
  program,
}: Partial<IBuildContext>): Promise<void> {
  if (!queryIds || !store) {
    return
  }
  const { pageQueryIds } = queryIds
  const state = store.getState()
  const pageQueryIdsCount = pageQueryIds.filter(id => state.pages.has(id))
    .length

  if (!pageQueryIdsCount) {
    return
  }

  const activity = reporter.createProgress(
    `run page queries`,
    pageQueryIdsCount,
    0,
    {
      id: `page-query-running`,
      parentSpan,
    }
  )

  activity.start()
  await processPageQueries(pageQueryIds, {
    state,
    activity,
    graphqlTracing: program?.graphqlTracing,
  })

  activity.done()
}
