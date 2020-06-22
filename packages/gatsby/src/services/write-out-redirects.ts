import { IBuildContext } from "./"
import reporter from "gatsby-cli/lib/reporter"
import { writeRedirects } from "../bootstrap/redirects-writer"

export async function writeOutRedirects({
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  // Write out redirects.
  const activity = reporter.activityTimer(`write out redirect data`, {
    parentSpan,
  })
  activity.start()
  await writeRedirects()
  activity.end()
}
