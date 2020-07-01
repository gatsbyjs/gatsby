import { build } from "../schema"
import reporter from "gatsby-cli/lib/reporter"
import { IDataLayerContext } from "../state-machines/data-layer/types"

export async function buildSchema({
  parentSpan,
}: Partial<IDataLayerContext>): Promise<void> {
  const activity = reporter.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
}
