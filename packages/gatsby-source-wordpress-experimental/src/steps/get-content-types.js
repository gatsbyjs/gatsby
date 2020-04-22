import { availablePostTypesQuery } from "~/utils/graphql-queries"
import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import { formatLogMessage } from "~/utils/format-log-message"

/**
 *
 * This func is temporary until support for this added in WPGQL
 * see https://github.com/wp-graphql/wp-graphql/issues/1045
 */
export const createContentTypeNodes = async (
  { webhookBody: { preview }, cache },
  pluginOptions
) => {
  if (preview) {
    return null
  }

  const contentTypesCacheKey = `WP_CONTENT_TYPES_DATA`
  let cachedContentTypesData = await cache.get(contentTypesCacheKey)

  const state = store.getState()
  const { schemaWasChanged } = state.remoteSchema

  const refetchContentTypes = schemaWasChanged || !cachedContentTypesData

  const { nodeQueries, fieldBlacklist } = state.remoteSchema

  const { helpers } = state.gatsbyApi

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`fetch content types`)
  )

  if (refetchContentTypes) {
    if (pluginOptions.verbose) {
      activity.start()
    }

    const { data } = await fetchGraphql({ query: availablePostTypesQuery })

    await cache.set(contentTypesCacheKey, data)

    cachedContentTypesData = data
  }

  const contentTypes = cachedContentTypesData.postTypes
    .filter(
      contentType => !fieldBlacklist.includes(contentType.fieldNames.plural)
    )
    .map(contentTypeObj => {
      const contentTypeQueryInfo = nodeQueries[contentTypeObj.fieldNames.plural]
      const { typeInfo } = contentTypeQueryInfo

      return helpers.actions.createNode({
        ...typeInfo,
        id: helpers.createNodeId(
          `${typeInfo.nodesTypeName}${typeInfo.singularName}--content-type`
        ),
        parent: null,
        internal: {
          contentDigest: helpers.createContentDigest(typeInfo),
          type: buildTypeName(`ContentType`),
        },
      })
    })

  if (pluginOptions.verbose && refetchContentTypes) {
    activity.end()
  }

  return contentTypes
}
