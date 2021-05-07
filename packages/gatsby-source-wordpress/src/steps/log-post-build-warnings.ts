import { Step } from "./../utils/run-steps"
import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"

export const logPostBuildWarnings: Step = async (): Promise<void> => {
  const {
    postBuildWarningCounts: { maxFileSizeBytesExceeded, mimeTypeExcluded },
    gatsbyApi: {
      helpers: { reporter },
    },
  } = store.getState()

  if (maxFileSizeBytesExceeded > 0) {
    /**
     * @todo create README for this
     */
    let message = `There were ${maxFileSizeBytesExceeded} files with file sizes that are above the maxFileSizeBytes config option and consequently were not fetched. Visit github.com/docs-url for more info`
    message = formatLogMessage(message)
    reporter.warn(message)
  }

  if (mimeTypeExcluded > 0) {
    /**
     * @todo create README entry for this
     */
    const message = `There were ${mimeTypeExcluded} files with mime types that were included in the excludeByMimeTypes config option and consequently were not fetched. Visit github.com/docs-url for more info`
    reporter.warn(message)
  }
}
