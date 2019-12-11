import { getAvailablePostTypesQuery } from "../graphql-queries"
import fetchGraphql from "../../utils/fetch-graphql"
import store from "../../store"

/**
 *
 * This func is temporary until support for this added in WPGQL
 * see https://github.com/wp-graphql/wp-graphql/issues/1045
 */
export const createContentTypeNodes = async () => {
  const state = store.getState()

  const { queries, fieldBlacklist } = state.introspection

  const {
    pluginOptions: { url },
    helpers,
  } = state.gatsbyApi

  const query = getAvailablePostTypesQuery()

  const { data } = await fetchGraphql({ url, query })

  const contentTypes = data.postTypes
    .filter(
      contentType => !fieldBlacklist.includes(contentType.fieldNames.plural)
    )
    .map(contentTypeObj => {
      const contentTypeQueryInfo = queries[contentTypeObj.fieldNames.plural]
      const { typeInfo } = contentTypeQueryInfo

      return helpers.actions.createNode({
        ...typeInfo,
        id: helpers.createNodeId(
          `${typeInfo.nodesTypeName}${typeInfo.singleName}--content-type`
        ),
        parent: null,
        internal: {
          contentDigest: helpers.createContentDigest(typeInfo),
          type: `WpContentType`,
        },
      })
    })

  return contentTypes
}
