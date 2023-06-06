import { Step } from "./../utils/run-steps"
import { getStore } from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"

export const logPostBuildWarnings: Step = async (): Promise<void> => {
  const {
    postBuildWarningCounts: { maxFileSizeBytesExceeded, mimeTypeExcluded },
    gatsbyApi: {
      helpers: { reporter },
    },
  } = getStore().getState()

  const helpUrl = `https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wordpress/docs/debugging-and-troubleshooting.md#media-file-download-skipped`

  const helpText = `Visit ${helpUrl} for more info.`

  if (maxFileSizeBytesExceeded > 0) {
    const message = formatLogMessage(
      `There were ${maxFileSizeBytesExceeded} files with file sizes that are above the maxFileSizeBytes config option and consequently were not fetched. ${helpText}`
    )

    reporter.warn(message)
  }

  if (mimeTypeExcluded > 0) {
    const message = formatLogMessage(
      `There were ${mimeTypeExcluded} files with mime types that were included in the excludeByMimeTypes config option and consequently were not fetched. ${helpText}`
    )

    reporter.warn(message)
  }
}
