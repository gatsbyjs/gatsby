import reporter from "gatsby-cli/lib/reporter"

const displayedWarnings = new Set<string>()

export const warnOnce = (message: string, key?: string): void => {
  const messageId = key ?? message
  if (!displayedWarnings.has(messageId)) {
    displayedWarnings.add(messageId)
    reporter.warn(message)
  }
}
