import { IBuildContext } from "./"

import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../utils/api-runner-node"

export async function createPagesStatefully({
  parentSpan,
  gatsbyNodeGraphQLFunction,
}: Partial<IBuildContext>): Promise<void> {
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
      graphql: gatsbyNodeGraphQLFunction,
      traceId: `initial-createPagesStatefully`,
      waitForCascadingActions: true,
      parentSpan: activity.span,
      // deferNodeMutation: true, //later
    },
    {
      activity,
    }
  )
  activity.end()
}
