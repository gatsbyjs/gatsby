import chalk from "chalk"
import { processPageQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"
import {
  showExperimentNoticeAfterTimeout,
  CancelExperimentNoticeCallbackOrUndefined,
} from "../utils/show-experiment-notice"
import { isCI } from "gatsby-core-utils"

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
      `We noticed your site takes longer than ideal to run page queries. We're changing
soon how we run queries in development so queries only run for pages as you
visit them. This avoids a lot of upfront work which helps make starting your
development server ${chalk.bold(`a whole lot faster`)}.

You can try out Query on Demand *today* by enabling it in your gatsby-config.js:

  module.exports = {
    flags: {
      QUERY_ON_DEMAND: true
    }
  }

Please do let us know how it goes (good, bad, or otherwise) and learn more about it
at https://gatsby.dev/query-on-demand-feedback`,
      ONE_MINUTE
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
