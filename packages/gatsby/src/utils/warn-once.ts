import reporter from "gatsby-cli/lib/reporter"
import { isWorker } from "gatsby-worker"

const displayedWarnings = new Set<string>()

export const warnOnce = (message: string, key?: string): void => {
  const messageId = key ?? message
  if (!displayedWarnings.has(messageId) && !isWorker) {
    displayedWarnings.add(messageId)
    reporter.warn(message)
  }
}
