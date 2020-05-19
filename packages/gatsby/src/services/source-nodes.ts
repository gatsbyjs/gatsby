import { IBuildContext } from "../state-machines/develop"
import sourceNodesAndGc from "../utils/source-nodes"

import reporter from "gatsby-cli/lib/reporter"

export async function sourceNodes({
  parentSpan,
  webhookBody,
}: IBuildContext): Promise<void> {
  const activity = reporter.activityTimer(`source and transform nodes`, {
    parentSpan,
  })
  console.log({ webhookBody })
  activity.start()
  await sourceNodesAndGc({
    parentSpan: activity.span,
    deferNodeMutation: !!(webhookBody && Object.keys(webhookBody).length),
    webhookBody,
  })
  activity.end()
}
