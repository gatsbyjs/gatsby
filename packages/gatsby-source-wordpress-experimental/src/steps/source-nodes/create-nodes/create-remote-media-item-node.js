import fs from "fs-extra"
import path from "path"

import retry from "async-retry"

import {
  createRemoteFileNode,
  createFileNodeFromBuffer,
} from "gatsby-source-filesystem"

import store from "~/store"
import { getGatsbyApi } from "~/utils/get-gatsby-api"
import { formatLogMessage } from "~/utils/format-log-message"
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

  let remoteFileNode

  try {
    // Otherwise we need to download it
    remoteFileNode = await retry(
      async () => {
        const createFileNodeRequirements = {
          parentNodeId: mediaItemNode.id,
          store: gatsbyStore,
          cache,
          createNode,
          createNodeId,
          reporter,
        }

        if (
          process.env.NODE_ENV === `development` &&
          pluginOptions.develop.hardCacheMediaFiles
        ) {
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
        retries: 10,
        factor: 2,
        minTimeout: 3000,
        maxTimeout: 60000,
        onRetry: error => {
          helpers.reporter.error(error)
          helpers.reporter.info(
            formatLogMessage(`retrying remote file download`)
          )
        },
      }
    )
  } catch (error) {
    helpers.reporter.info(`Couldn't fetch remote file ${mediaItemUrl}`)
    helpers.reporter.panic(error)

    return null
  }

  // push it's id and url to our store for caching,
  // so we can touch this node next time
  // and so we can easily access the id by source url later
  store.dispatch.imageNodes.pushNodeMeta({
    id: remoteFileNode.id,
    sourceUrl: mediaItemUrl,
    modifiedGmt,
  })

  if (
    process.env.NODE_ENV === `development` &&
    pluginOptions.develop.hardCacheMediaFiles
  ) {
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
