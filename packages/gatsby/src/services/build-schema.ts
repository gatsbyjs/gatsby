import { build } from "../schema"
import reporter from "gatsby-cli/lib/reporter"
import { IDataLayerContext } from "../state-machines/data-layer/types"

export async function buildSchema({
  parentSpan,
  refresh,
}: Partial<IDataLayerContext>): Promise<void> {
  if (
    refresh &&
    Boolean(process.env.GATSBY_EXPERIMENTAL_DISABLE_SCHEMA_REBUILD)
  ) {
    return
  }
  const activity = reporter.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
}
