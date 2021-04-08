import { rebuildWithSitePage } from "../schema"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"

export async function rebuildSchemaWithSitePage({
  parentSpan,
}: Partial<IQueryRunningContext>): Promise<void> {
  if (!process.env.GATSBY_EXPERIMENTAL_NO_PAGE_NODES) {
    const activity = reporter.activityTimer(`update schema`, {
      parentSpan,
    })
    activity.start()
    await rebuildWithSitePage({ parentSpan })
    activity.end()
  }
}
