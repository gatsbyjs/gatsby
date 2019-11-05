import { LAST_COMPLETED_SOURCE_TIME } from "../constants"
import fetchAndApplyNodeUpdates from "./fetch-node-updates"

const startIntervalRefetcher = (_, helpers, pluginOptions) => {
  const { cache } = helpers

  const msRefetchInterval = 300
  const refetcher = async () => {
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

    setTimeout(refetcher, msRefetchInterval)
  }

  // wait 10 seconds before starting the refetcher
  setTimeout(() => {
    helpers.reporter.info(
      `[gatsby-source-wpgraphql] Watching for WordPress changes`
    )
    refetcher()
  }, 10000)
}

export default startIntervalRefetcher
