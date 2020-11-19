import { processPageQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"
import {
  showExperimentNoticeAfterTimeout,
  CancelExperimentNoticeCallbackOrUndefined,
} from "../utils/show-experiment-notice"
import { isCI } from "gatsby-core-utils"

const TWO_MINUTES = 2 * 60 * 1000

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
      `queryOnDemand`,
      reporter.stripIndent(`
        Your local development experience is about to get better, faster, and stronger!

        Your friendly Gatsby maintainers detected your site takes longer than ideal to run page queries. We're working right now to improve this.

        If you're interested in trialing out one of these future improvements *today* which should make your local development experience faster, go ahead and run your site with QUERY_ON_DEMAND enabled.

        GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND=true gatsby develop

        Please do let us know how it goes (good, bad, or otherwise) and learn more about it at https://gatsby.dev/query-on-demand-feedback
      `),
      TWO_MINUTES
    )
  }

  await processPageQueries(pageQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  if (cancelNotice) {
    cancelNotice()
  }

  activity.done()
}
