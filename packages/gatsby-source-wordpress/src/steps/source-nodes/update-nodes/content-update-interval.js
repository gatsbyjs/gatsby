import { formatLogMessage } from "~/utils/format-log-message"
import { getStore, withPluginKey, snapshotContext } from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { contentPollingQuery } from "../../../utils/graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"
import { LAST_COMPLETED_SOURCE_TIME } from "../../../constants"

/**
 * This function checks wether there is atleast 1 WPGatsby action ready to be processed by Gatsby
 * If there is, it calls the refresh webhook so that schema customization and source nodes run again.
 */
const checkForNodeUpdates = async ({ cache, emitter }) => {
  // pause polling until we know wether or not there are new actions
  // if there aren't any we will unpause below, if there are some we will unpause
  // at the end of sourceNodes (triggered by WEBHOOK_RECEIVED below)
  getStore().dispatch.develop.pauseRefreshPolling()

  // get the last sourced time
  const lastCompletedSourceTime = await cache.get(
    withPluginKey(LAST_COMPLETED_SOURCE_TIME)
  )
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
    emitter.emit(`WEBHOOK_RECEIVED`, {
      webhookBody: {
        since,
        refreshing: true,
      },
      pluginName: `gatsby-source-wordpress`,
    })
  } else {
    // set new last completed source time and move on
    await cache.set(withPluginKey(LAST_COMPLETED_SOURCE_TIME), Date.now())
    getStore().dispatch.develop.resumeRefreshPolling()
  }
}

const refetcher = async (
  msRefetchInterval,
  helpers,
  { reconnectionActivity = null, retryCount = 1 } = {}
) => {
  try {
    const { refreshPollingIsPaused } = getStore().getState().develop

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

let startedPolling = false
let firstCompilationDone = false

/**
 * Starts constantly refetching the latest WordPress changes
 * so we can update Gatsby nodes when data changes
 */
const startPollingForContentUpdates = helpers => {
  if (
    startedPolling ||
    process.env.WP_DISABLE_POLLING ||
    process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
  ) {
    return
  }

  startedPolling = true

  const { verbose, develop } = getStore().getState().gatsbyApi.pluginOptions
  const restoreContext = snapshotContext()
  const msRefetchInterval = develop.nodeUpdateInterval

  helpers.emitter.on(`COMPILATION_DONE`, () => {
    /**
     * we only want to start our refetcher helper 1 time after the first COMPILATION_DONE event.
     * This event happens when the dev server is ready. It also happens after saving a code change. We only want to run our code 1 time.
     * onCreateDevServer (the node API we're hooking into) is called before the dev server is ready.
     * Running our logic at that point is problematic because we could end up triggering the WEBHOOK_RECEIVED event before the dev server is ready and this can cause Gatsby to throw errors. So we're hooking into COMPILATION_DONE to avoid that problem.
     */
    if (!firstCompilationDone) {
      firstCompilationDone = true

      // wait a second so that terminal output is more smooth
      setTimeout(() => {
        if (verbose) {
          // I'm not sure why, but we're losing the ALS context here so we need to restore it manually
          restoreContext()
          helpers.reporter.log(``)
          helpers.reporter.info(
            formatLogMessage`Watching for WordPress changes`
          )
        }

        refetcher(msRefetchInterval, helpers)
      }, 1000)
    }
  })
}

export { startPollingForContentUpdates }
