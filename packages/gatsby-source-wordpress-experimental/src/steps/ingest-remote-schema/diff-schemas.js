import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import gql from "~/utils/gql"
import { formatLogMessage } from "~/utils/format-log-message"
import { LAST_COMPLETED_SOURCE_TIME } from "~/constants"

const checkIfSchemaHasChanged = async (_, pluginOptions) => {
  const state = store.getState()

  const { helpers } = state.gatsbyApi

  const lastCompletedSourceTime = await helpers.cache.get(
    LAST_COMPLETED_SOURCE_TIME
  )

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`diff schemas`)
  )

  if (pluginOptions.verbose && lastCompletedSourceTime) {
    activity.start()
  }

  const MD5_CACHE_KEY = `introspection-node-query-md5`

  const { data } = await fetchGraphql({
    query: gql`
      {
        schemaMd5
      }
    `,
  })

  const { schemaMd5 } = data

  const cachedSchemaMd5 = await helpers.cache.get(MD5_CACHE_KEY)

  await helpers.cache.set(MD5_CACHE_KEY, schemaMd5)

  const schemaWasChanged = schemaMd5 !== cachedSchemaMd5

  if (
    lastCompletedSourceTime &&
    schemaWasChanged &&
    pluginOptions &&
    pluginOptions.verbose
  ) {
    helpers.reporter.log(``)
    helpers.reporter.warn(
      formatLogMessage(
        `The remote schema has changed since the last build, re-fetching all data`
      )
    )
    helpers.reporter.info(
      formatLogMessage(`Cached schema md5: ${cachedSchemaMd5}`)
    )
    helpers.reporter.info(formatLogMessage(`Remote schema md5: ${schemaMd5}`))
    helpers.reporter.log(``)
  } else if (!lastCompletedSourceTime && pluginOptions.verbose) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(
        `\n\n\tThis is either your first build or the cache was cleared.\n\tPlease wait while your WordPress data is synced to your Gatsby cache.\n\n\tMaybe now's a good time to get up and stretch? :D\n`
      )
    )
  }

  // record wether the schema changed so other logic can beware
  store.dispatch.remoteSchema.setSchemaWasChanged(schemaWasChanged)

  if (pluginOptions.verbose && lastCompletedSourceTime) {
    activity.end()
  }

  return schemaWasChanged
}

export { checkIfSchemaHasChanged }
