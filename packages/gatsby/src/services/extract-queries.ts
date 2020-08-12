import reporter from "gatsby-cli/lib/reporter"
import { extractQueries as extractQueriesAndWatch } from "../query/query-watcher"
import apiRunnerNode from "../utils/api-runner-node"
import { IQueryRunningContext } from "../state-machines/query-running/types"

export async function extractQueries({
  parentSpan,
}: Partial<IQueryRunningContext>): Promise<void> {
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
