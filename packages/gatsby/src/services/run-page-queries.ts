import { processPageQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"
import {
  showExperimentNoticeAfterTimeout,
  CancelExperimentNoticeCallbackOrUndefined,
} from "../utils/show-experiment-notice"
import { isCI } from "gatsby-core-utils"
import { processNodeManifests } from "../utils/node-manifest"

const ONE_MINUTE = 1 * 60 * 1000

export async function runPageQueries({
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

  let cancelNotice: CancelExperimentNoticeCallbackOrUndefined
  if (
    process.env.gatsby_executing_command === `develop` &&
    !process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND &&
    !isCI()
  ) {
    cancelNotice = showExperimentNoticeAfterTimeout(
      `Query On Demand`,
      `https://gatsby.dev/query-on-demand-feedback`,
      `which avoids running page queries in development until you visit a page — so a lot less upfront work. Here's how to try it:

modules.exports = {
  flags: { QUERY_ON_DEMAND: true },
  plugins: [...]
}
`,
      ONE_MINUTE
    )
  }

  await processPageQueries(pageQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  if (process.env.NODE_ENV !== `development`) {
    /**
     * only process node manifests here when not in develop. for gatsby develop we process node manifests in src/query/query-watcher.ts everytime queries are re-run. Because we process node manifests in this location for gatsby build we have all the information needed to create the manifests. In query-watcher during gatsby build we might not have all information about created pages and queries.
     */
    await processNodeManifests()
  }

  if (cancelNotice) {
    cancelNotice()
  }

  activity.done()
}
