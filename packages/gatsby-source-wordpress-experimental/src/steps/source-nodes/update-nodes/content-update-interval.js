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

const maybeStartPollingForContentUpdates = (helpers, pluginOptions) => {
  if (
    process.env.RUNNER_TYPE === `PREVIEW` ||
    process.env.ENABLE_GATSBY_REFRESH_ENDPOINT ||
    process.env.WP_DISABLE_POLLING
  ) {
    return
  }

  startPollingForContentUpdates(helpers, pluginOptions)
}

export { startPollingForContentUpdates, maybeStartPollingForContentUpdates }
