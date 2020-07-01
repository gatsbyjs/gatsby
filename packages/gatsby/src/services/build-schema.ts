import { IBuildContext } from "./"

import { build } from "../schema"
import reporter from "gatsby-cli/lib/reporter"

export async function buildSchema({
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  const activity = reporter.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
}
