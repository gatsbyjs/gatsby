import { formatLogMessage } from "~/utils/format-log-message"
import store from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { contentPollingQuery } from "../../../utils/graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"
import { LAST_COMPLETED_SOURCE_TIME } from "../../../constants"

/**
 * This function checks whether there is at least 1 WPGatsby action ready to be processed by Gatsby
 * If there is, it calls the refresh webhook so that schema customization and source nodes run again.
 */
const checkForNodeUpdates = async ({ cache, emitter }) => {
  // get the last sourced time
  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)
  const since = lastCompletedSourceTime - 500

  // make a graphql request for any actions that have happened since
  const {
    data: {
      actionMonitorActions: { nodes: newActions },
    },
  } = await fetchGraphql({
    query: contentPollingQuery,
    variables: {
      since,
    },
    // throw fetch errors and graphql errors so we can auto recover in refetcher()
    throwGqlErrors: true,
    throwFetchErrors: true,
  })

  if (newActions.length) {
    // if there's at least 1 new action, pause polling,
    // refresh Gatsby schema+nodes and continue on
    store.dispatch.develop.pauseRefreshPolling()

    emitter.emit(`WEBHOOK_RECEIVED`, {
      webhookBody: {
        since,
        refreshing: true,
      },
    })
  } else {
    // set new last completed source time and move on
    await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
  }
}

const refetcher = async (
  msRefetchInterval,
  helpers,
  { reconnectionActivity = null, retryCount = 1 } = {}
) => {
  try {
    const { refreshPollingIsPaused } = store.getState().develop

    if (!refreshPollingIsPaused) {
      await checkForNodeUpdates(helpers)
    }

    if (reconnectionActivity) {
      reconnectionActivity.end()
      helpers.reporter.success(
        formatLogMessage(
          `Content updates re-connected after ${retryCount} ${
            retryCount === 1 ? `try` : `tries`
          }`
        )
      )

      reconnectionActivity = null
      retryCount = 1
    }
  } catch (e) {
    const { pluginOptions } = getGatsbyApi()
    if (pluginOptions?.debug?.throwRefetchErrors) {
      throw e
    }

    if (!reconnectionActivity) {
      reconnectionActivity = helpers.reporter.activityTimer(
        formatLogMessage(`Content update error: "${e.message}"`)
      )
      reconnectionActivity.start()
      reconnectionActivity.setStatus(`retrying...`)
    } else {
      retryCount++
      reconnectionActivity.setStatus(`retried ${retryCount} times`)
    }

    // retry after retry count times 5 seconds
    const retryTime = retryCount * 5000
    // if the retry time is greater than or equal to the max (60 seconds)
    // use the max, otherwise use the retry time
    const maxWait = 60000
    const waitFor = retryTime >= maxWait ? maxWait : retryTime

    await new Promise(resolve => setTimeout(resolve, waitFor))
  }

  setTimeout(
    () =>
      refetcher(msRefetchInterval, helpers, {
        reconnectionActivity,
        retryCount,
      }),
    msRefetchInterval
  )
}

/**
 * Starts constantly refetching the latest WordPress changes
 * so we can update Gatsby nodes when data changes
 */
const startPollingForContentUpdates = helpers => {
  if (
    process.env.WP_DISABLE_POLLING ||
    process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
  ) {
    return
  }

  const { verbose, develop } = store.getState().gatsbyApi.pluginOptions

  const msRefetchInterval = develop.nodeUpdateInterval

  if (verbose) {
    helpers.reporter.log(``)
    helpers.reporter.info(formatLogMessage`Watching for WordPress changes`)
  }

  refetcher(msRefetchInterval, helpers)
}

export { startPollingForContentUpdates }
