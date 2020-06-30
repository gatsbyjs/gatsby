import { IBuildContext } from "./"

import { build } from "../schema"
import reporter from "gatsby-cli/lib/reporter"

export async function buildSchema({
  store,
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  if (!store) {
    reporter.panic(`Cannot build schema before store initialization`)
  }
  const activity = reporter.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
}
