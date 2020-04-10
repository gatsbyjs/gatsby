import fs from "fs-extra"
import path from "path"

import retry from "async-retry"

import { createFileNodeFromBuffer } from "gatsby-source-filesystem"

import createRemoteFileNode from "./create-remote-file-node/index"

import store from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import urlToPath from "~/utils/url-to-path"

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

export const createRemoteMediaItemNode = async ({ mediaItemNode }) => {
  const { helpers, pluginOptions } = getGatsbyApi()
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

  const { mediaItemUrl, modifiedGmt } = mediaItemNode

  if (!mediaItemUrl) {
    return null
  }

  const hardCachedFileRelativePath = urlToPath(mediaItemUrl)
  const hardCachedMediaFilesDirectory = `${process.cwd()}/.wordpress-cache`

  const hardCachedFilePath =
    hardCachedMediaFilesDirectory + hardCachedFileRelativePath

  const hardCacheMediaFiles =
    (process.env.NODE_ENV === `development` &&
      pluginOptions.develop.hardCacheMediaFiles) ||
    (process.env.NODE_ENV === `production` &&
      pluginOptions.production.hardCacheMediaFiles)

  // Otherwise we need to download it
  const remoteFileNode = await retry(
    async () => {
      const createFileNodeRequirements = {
        parentNodeId: mediaItemNode.id,
        store: gatsbyStore,
        cache,
        createNode,
        createNodeId,
        reporter,
      }

      if (hardCacheMediaFiles) {
        // check for file in .wordpress-cache/wp-content
        // if it exists, use that to create a node from instead of
        // fetching from wp
        try {
          const buffer = await fs.readFile(hardCachedFilePath)
          const node = await createFileNodeFromBuffer({
            buffer,
            ...createFileNodeRequirements,
          })

          if (node) {
            return node
          }
        } catch (e) {
          // ignore errors, we'll download the image below if it doesn't exist
        }
      }

      const node = await createRemoteFileNode({
        url: mediaItemUrl,
        ...createFileNodeRequirements,
      })

      return node
    },
    {
      retries: 3,
      factor: 1.1,
      minTimeout: 5000,
    }
  )

  // push it's id and url to our store for caching,
  // so we can touch this node next time
  // and so we can easily access the id by source url later
  store.dispatch.imageNodes.pushNodeMeta({
    id: remoteFileNode.id,
    sourceUrl: mediaItemUrl,
    modifiedGmt,
  })

  if (hardCacheMediaFiles) {
    try {
      // make sure the directory exists
      await fs.ensureDir(path.dirname(hardCachedFilePath))
      // copy our downloaded file to our existing directory
      await fs.copyFile(remoteFileNode.absolutePath, hardCachedFilePath)
    } catch (e) {
      helpers.reporter.panic(e)
    }
  }

  // and use it
  return remoteFileNode
}
