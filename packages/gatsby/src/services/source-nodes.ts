import { IBuildContext } from "../state-machines/develop"

const sourceNodesAndGc = require(`../utils/source-nodes`)
import reporter from "gatsby-cli/lib/reporter"

export async function sourceNodes({
  parentSpan,
}: IBuildContext): Promise<void> {
  const activity = reporter.activityTimer(`source and transform nodes`, {
    parentSpan,
  })
  activity.start()
  await sourceNodesAndGc({ parentSpan: activity.span, deferNodeMutation: true })
  activity.end()
}
