const reporter = require(`gatsby-cli/lib/reporter`)
const apiRunnerNode = require(`../utils/api-runner-node`)

export async function createPages({ parentSpan, graphqlRunner }): Promise<any> {
  const activity = reporter.activityTimer(`createPages`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(
    `createPages`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPages`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    { activity }
  )
  activity.end()
}
