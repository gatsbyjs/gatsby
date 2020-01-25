import { LAST_COMPLETED_SOURCE_TIME } from "../../constants"
import fetchAndApplyNodeUpdates from "./fetch-node-updates"
import formatLogMessage from "../../utils/format-log-message"
import store from "../../store"

const refetcher = async api => {
  const { cache, helpers, pluginOptions, msRefetchInterval } = api
  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  const { didUpdate } = await fetchAndApplyNodeUpdates(
    {
      since: lastCompletedSourceTime,
      intervalRefetching: true,
    },
    helpers,
    pluginOptions
  )

  if (didUpdate) {
    await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
  }

  setTimeout(() => refetcher(api), msRefetchInterval)
}

/**
 * Starts constantly refetching the latest WordPress changes
 * so we can update Gatsby nodes when data changes
 */
const startPollingForContentUpdates = (helpers, pluginOptions) => {
  const { cache } = helpers
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

  refetcher({ cache, helpers, pluginOptions, msRefetchInterval })
}

export default startPollingForContentUpdates
