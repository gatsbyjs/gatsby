import { availablePostTypesQuery } from "../../utils/graphql-queries"
import fetchGraphql from "../../utils/fetch-graphql"
import store from "../../store"
import { buildTypeName } from "../create-schema-customization/helpers"

/**
 *
 * This func is temporary until support for this added in WPGQL
 * see https://github.com/wp-graphql/wp-graphql/issues/1045
 */
export const createContentTypeNodes = async () => {
  const state = store.getState()

  const { nodeQueries, fieldBlacklist } = state.remoteSchema

  const { helpers } = state.gatsbyApi

  const { data } = await fetchGraphql({ query: availablePostTypesQuery })

  const contentTypes = data.postTypes
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

  return contentTypes
}
