import reporter from "gatsby-cli/lib/reporter"
import { writeAll } from "../bootstrap/requires-writer"
import { IQueryRunningContext } from "../state-machines/query-running/types"

export async function writeOutRequires({
  store,
  parentSpan,
}: Partial<IQueryRunningContext>): Promise<void> {
  if (!store) {
    reporter.panic(`No redux store`)
  }
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
