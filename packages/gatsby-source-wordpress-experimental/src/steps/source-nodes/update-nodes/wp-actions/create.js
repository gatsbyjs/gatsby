import fetchGraphql from "~/utils/fetch-graphql"
import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"

const wpActionCREATE = async ({
  helpers,
  intervalRefetching,
  cachedNodeIds,
  wpAction,
}) => {
  // if this post isn't published, we don't want it.
  if (wpAction.referencedPostStatus !== `publish`) {
    return cachedNodeIds
  }

  const { verbose } = store.getState().gatsbyApi.pluginOptions

  // otherwise we need to fetch the post
  // so get the right gql query from redux
  const { nodeQueries } = store.getState().remoteSchema
  const queryInfo = Object.values(nodeQueries).find(
    q => q.typeInfo.singularName === wpAction.referencedPostSingularName
  )
  const { nodeQueryString: query } = queryInfo

  // fetch the new post
  const { data } = await fetchGraphql({
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })
  const nodeContent = data[wpAction.referencedPostSingularName]

  // create a node from it
  const { actions, createContentDigest } = helpers
  const nodeId = wpAction.referencedPostGlobalRelayID

  const node = {
    ...nodeContent,
    id: nodeId,
    nodeType: queryInfo.typeInfo.nodesTypeName,
    type: queryInfo.typeInfo.nodesTypeName,
  }

  await actions.createNode({
    ...node,
    parent: null,
    internal: {
      contentDigest: createContentDigest(nodeContent),
      type: buildTypeName(queryInfo.typeInfo.nodesTypeName),
    },
  })

  if (intervalRefetching) {
    helpers.reporter.log(``)
    helpers.reporter.info(
      formatLogMessage(
        `created ${wpAction.referencedPostSingularName}${
          verbose
            ? `

  {
    ${wpAction.referencedPostSingularName}Id: ${wpAction.referencedPostID},
    id: ${nodeId}
  }`
            : ` ${wpAction.referencedPostID}`
        }`
      )
    )
    helpers.reporter.log(``)
  }

  // add our node id to the list of cached node id's
  return [nodeId, ...cachedNodeIds]
}

export default wpActionCREATE
