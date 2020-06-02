import { IBuildContext } from "./"

import reporter from "gatsby-cli/lib/reporter"
import { extractQueries as extractQueriesAndWatch } from "../query/query-watcher"
import apiRunnerNode from "../utils/api-runner-node"

export async function extractQueries({
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  const activity = reporter.activityTimer(`onPreExtractQueries`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreExtractQueries`, {
    parentSpan: activity.span,
  })
  activity.end()

  await extractQueriesAndWatch({ parentSpan })
}
