import { parse } from "url"
import fetchGraphql from "../../../utils/fetch-graphql"

import { getPageQuery } from "../graphql-queries"

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

  // fetch the new post
  const { url: wpUrl } = pluginOptions
  const query = getPageQuery(wpAction.referencedPostSingleName)
  const { data } = await fetchGraphql({
    url: wpUrl,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  // create a node from it
  const { actions, createContentDigest, createNodeId } = helpers
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  const node = {
    ...data.wpContent,
    id: nodeId,
    contentType: wpAction.referencedPostSingleName,
    // @todo move pagination to create-pages.js using pageContext
    // we can't add anything here since we don't know what the next/prev nodes are.
    pagination: {
      previous___NODE: null,
      next___NODE: null,
      pageNumber: null,
      isFirst: null,
      isLast: null,
    },
    path: parse(data.wpContent.link).pathname,
  }

  await actions.createNode({
    ...node,
    parent: null,
    internal: {
      contentDigest: createContentDigest(node),
      type: `WpContent`,
    },
  })

  if (intervalRefetching) {
    helpers.reporter.info(
      `[gatsby-source-wordpress] created ${wpAction.referencedPostSingleName} ${wpAction.referencedPostID}`
    )
  }

  // add our node id to the list of cached node id's
  return [nodeId, ...cachedNodeIds]
}

export default wpActionCREATE
