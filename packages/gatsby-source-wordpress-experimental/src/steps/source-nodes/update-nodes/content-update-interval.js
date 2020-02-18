import fetchAndApplyNodeUpdates from "./fetch-node-updates"
import { formatLogMessage } from "~/utils/format-log-message"
import store from "~/store"

const refetcher = async msRefetchInterval => {
  await fetchAndApplyNodeUpdates({
    intervalRefetching: true,
  })

  setTimeout(() => refetcher(msRefetchInterval), msRefetchInterval)
}

/**
 * Starts constantly refetching the latest WordPress changes
 * so we can update Gatsby nodes when data changes
 */
const startPollingForContentUpdates = (helpers, pluginOptions) => {
  const { verbose } = store.getState().gatsbyApi.pluginOptions

  const msRefetchInterval =
    pluginOptions &&
    pluginOptions.develop &&
    pluginOptions.develop.nodeUpdateInterval
      ? pluginOptions.develop.nodeUpdateInterval
      : 300

  if (verbose) {
    helpers.reporter.log(``)
    helpers.reporter.info(formatLogMessage`Watching for WordPress changes`)
  }

  refetcher(msRefetchInterval)
}

export { startPollingForContentUpdates }
