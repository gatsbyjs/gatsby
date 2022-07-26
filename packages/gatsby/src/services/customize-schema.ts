import reporter from "gatsby-cli/lib/reporter"
import { createSchemaCustomization } from "../utils/create-schema-customization"
import { IDataLayerContext } from "../state-machines/data-layer/types"

export async function customizeSchema({
  parentSpan,
  deferNodeMutation,
  refresh, // webhookBody,//coming soon
}: Partial<IDataLayerContext>): Promise<void> {
  const activity = reporter.activityTimer(`createSchemaCustomization`, {
    parentSpan,
  })
  activity.start()
  await createSchemaCustomization({
    parentSpan,
    refresh,
    deferNodeMutation,
    // webhookBody,
  })
  activity.end()
}
