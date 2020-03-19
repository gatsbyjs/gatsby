const reporter = require(`gatsby-cli/lib/reporter`)
const apiRunnerNode = require(`../utils/api-runner-node`)

export async function createPagesStatefully({
  parentSpan,
  graphqlRunner,
}): Promise<any> {
  // A variant on createPages for plugins that want to
  // have full control over adding/removing pages. The normal
  // "createPages" API is called every time (during development)
  // that data changes.
  const activity = reporter.activityTimer(`createPagesStatefully`, {
    parentSpan,
  })
  activity.start()
  await apiRunnerNode(
    `createPagesStatefully`,
    {
      graphql: graphqlRunner,
      traceId: `initial-createPagesStatefully`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
    },
    {
      activity,
    }
  )
  activity.end()
}
