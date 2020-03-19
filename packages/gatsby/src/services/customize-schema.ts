const reporter = require(`gatsby-cli/lib/reporter`)
import { createSchemaCustomization } from "../utils/create-schema-customization"

export async function customizeSchema({ parentSpan }): Promise<any> {
  const activity = reporter.activityTimer(`createSchemaCustomization`, {
    parentSpan,
  })
  activity.start()
  await createSchemaCustomization({
    parentSpan,
  })
  activity.end()
}
