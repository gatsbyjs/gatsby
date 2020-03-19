const reporter = require(`gatsby-cli/lib/reporter`)
const {
  extractQueries: extractQueriesAndWatch,
} = require(`../query/query-watcher`)
const apiRunnerNode = require(`../utils/api-runner-node`)

export async function extractQueries({ parentSpan }): Promise<any> {
  const activity = reporter.activityTimer(`onPreExtractQueries`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(`onPreExtractQueries`, { parentSpan: activity.span })
  activity.end()

  await extractQueriesAndWatch({ parentSpan })
}
