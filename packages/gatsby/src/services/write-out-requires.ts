import { IBuildContext } from "./"
import reporter from "gatsby-cli/lib/reporter"
import { writeAll } from "../bootstrap/requires-writer"
import { assertStore } from "../utils/assert-store"

export async function writeOutRequires({
  store,
  parentSpan,
}: Partial<IBuildContext>): Promise<void> {
  assertStore(store)

  // Write out files.
  const activity = reporter.activityTimer(`write out requires`, {
    parentSpan,
  })
  activity.start()
  try {
    await writeAll(store.getState())
  } catch (err) {
    reporter.panic(`Failed to write out requires`, err)
  }
  activity.end()
}
