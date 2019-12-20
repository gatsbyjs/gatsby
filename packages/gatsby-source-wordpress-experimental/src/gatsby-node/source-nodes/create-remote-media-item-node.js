import pRetry from "p-retry"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import store from "../../store"

export const getFileNodeMetaBySourceUrl = sourceUrl => {
  const fileNodesMetaByUrls = store.getState().imageNodes.nodeMetaByUrl

  return fileNodesMetaByUrls[sourceUrl]
}

export const getFileNodeByMediaItemNode = async ({
  mediaItemNode,
  helpers,
}) => {
  const { sourceUrl, modifiedGmt } = mediaItemNode

  const existingNodeMeta = getFileNodeMetaBySourceUrl(sourceUrl)

  if (
    // if we already have this image
    existingNodeMeta &&
    existingNodeMeta.id &&
    // and it hasn't been modified
    existingNodeMeta.modifiedGmt === modifiedGmt
  ) {
    const node = await helpers.getNode(existingNodeMeta.id)

    return node
  }

  return null
}

export const createRemoteMediaItemNode = async ({ mediaItemNode, helpers }) => {
  const existingNode = await getFileNodeByMediaItemNode({
    mediaItemNode,
    helpers,
  })

  if (existingNode) {
    return existingNode
  }

  const {
    store: gatsbyStore,
    cache,
    createNodeId,
    reporter,
    actions: { createNode },
  } = helpers

  const { sourceUrl, modifiedGmt } = mediaItemNode

  // Otherwise we need to download it
  const remoteFileNode = await pRetry(
    async () => {
      const node = await createRemoteFileNode({
        url: sourceUrl,
        parentNodeId: mediaItemNode.id,
        store: gatsbyStore,
        cache,
        createNode,
        createNodeId,
        reporter,
      })

      if (!node) {
        throw new Error(`Couldn't create file node from ${sourceUrl}`)
      }

      return node
    },
    { retries: 10, onFailedAttempt: error => helpers.reporter.error(error) }
  )

  // push it's id and url to our store for caching,
  // so we can touch this node next time
  // and so we can easily access the id by source url later
  store.dispatch.imageNodes.pushNodeMeta({
    id: remoteFileNode.id,
    sourceUrl,
    modifiedGmt,
  })

  // and use it
  return remoteFileNode
}
