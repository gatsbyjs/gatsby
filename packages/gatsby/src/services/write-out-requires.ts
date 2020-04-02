import requiresWriter from "../bootstrap/requires-writer"
import { IBuildContext } from "../state-machines/develop"

const reporter = require(`gatsby-cli/lib/reporter`)

export async function writeOutRequires({
  store,
  parentSpan,
}: IBuildContext): Promise<void> {
  if (!store) {
    throw new Error(`Missing store`)
  }
  // Write out files.
  const activity = reporter.activityTimer(`write out requires`, {
    parentSpan,
  })
  activity.start()
  try {
    await requiresWriter.writeAll(store.getState())
  } catch (err) {
    reporter.panic(`Failed to write out requires`, err)
  }
  activity.end()
}
