import { IBuildContext } from "./"
import { rebuildWithSitePage } from "../schema"
import reporter from "gatsby-cli/lib/reporter"

export async function rebuildSchemaWithSitePage({
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  const activity = reporter.activityTimer(`updating schema`, {
    parentSpan,
  })
  activity.start()
  await rebuildWithSitePage({ parentSpan })
  activity.end()
}
