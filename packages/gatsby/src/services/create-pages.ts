import { IBuildContext } from "../state-machines/develop"

import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"

export async function createPages({
  parentSpan,
  graphqlRunner,
}: IBuildContext): Promise<void> {
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
      deferNodeMutation: true,
    },
    { activity }
  )
  activity.end()
}
