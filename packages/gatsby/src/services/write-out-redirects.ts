import reporter from "gatsby-cli/lib/reporter"
import { writeRedirects } from "../bootstrap/redirects-writer"
import { IDataLayerContext } from "../state-machines/data-layer/types"

export async function writeOutRedirects({
  parentSpan,
}: Partial<IDataLayerContext>): Promise<void> {
  // Write out redirects.
  const activity = reporter.activityTimer(`write out redirect data`, {
    parentSpan,
  })
  activity.start()
  await writeRedirects()
  activity.end()
}
