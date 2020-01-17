import capitalize from "capitalize"
import fetchGraphql from "../../../utils/fetch-graphql"
import store from "../../../store"
import formatLogMessage from "../../../utils/format-log-message"

const wpActionCREATE = async ({
  helpers,
  pluginOptions,
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
  const { queries } = store.getState().introspection
  const queryInfo = Object.values(queries).find(
    q => q.typeInfo.singularName === wpAction.referencedPostSingularName
  )
  const { nodeQueryString: query } = queryInfo

  // fetch the new post
  const { url: wpUrl } = pluginOptions
  const { data } = await fetchGraphql({
    url: wpUrl,
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
    contentType: queryInfo.typeInfo.nodesTypeName,
    type: queryInfo.typeInfo.nodesTypeName,
  }

  await actions.createNode({
    ...node,
    parent: null,
    internal: {
      contentDigest: createContentDigest(nodeContent),
      type: `Wp${queryInfo.typeInfo.nodesTypeName}`,
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
