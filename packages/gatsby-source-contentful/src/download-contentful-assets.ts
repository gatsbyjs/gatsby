import type { Actions, SourceNodesArgs } from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import type { IContentfulAsset } from "./types/contentful"

/**
 * @name distributeWorkload
 * @param workers A list of async functions to complete
 * @param {number} count The number of task runners to use (see assetDownloadWorkers in config)
 */
async function distributeWorkload(workers, count = 50): Promise<void> {
  const methods = workers.slice()

  async function task(): Promise<void> {
    while (methods.length > 0) {
      await methods.pop()()
    }
  }

  await Promise.all(new Array(count).fill(undefined).map(() => task()))
}

interface IRemoteData {
  fileNodeID: string
}

/**
 * @name downloadContentfulAssets
 * @description Downloads Contentful assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localFile` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */
export async function downloadContentfulAssets(
  gatsbyFunctions: SourceNodesArgs,
  actions: Actions,
  assetNodes: Array<IContentfulAsset>,
  assetDownloadWorkers: number
): Promise<void> {
  const { createNodeId, cache, reporter, getNode } = gatsbyFunctions
  const { createNode, touchNode, createNodeField } = actions

  // Any ContentfulAsset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localFile` to link an asset or not.

  const bar = reporter.createProgress(
    `Downloading Contentful Assets`,
    assetNodes.length
  )
  bar.start()
  await distributeWorkload(
    assetNodes.map(assetNode => async (): Promise<void> => {
      let fileNodeID
      const {
        sys: { id, locale },
        url,
      } = assetNode
      const remoteDataCacheKey = `contentful-asset-${id}-${locale}`
      const cacheRemoteData: IRemoteData = await cache.get(remoteDataCacheKey)

      if (!url) {
        reporter.warn(`The asset with id: ${id} has no url.`)
        return Promise.resolve()
      }

      // Avoid downloading the asset again if it's been cached
      // Note: Contentful Assets do not provide useful metadata
      // to compare a modified asset to a cached version?
      if (cacheRemoteData) {
        fileNodeID = cacheRemoteData.fileNodeID
        const existingNode = getNode(cacheRemoteData.fileNodeID)
        if (existingNode) {
          touchNode(existingNode)
        }
      }

      // If we don't have cached data, download the file
      if (!fileNodeID) {
        const fileNode = await createRemoteFileNode({
          url,
          cache,
          createNode,
          createNodeId,
        })

        if (fileNode) {
          bar.tick()
          fileNodeID = fileNode.id

          await cache.set(remoteDataCacheKey, { fileNodeID })
        }
      }

      if (fileNodeID) {
        createNodeField({
          node: assetNode,
          name: `localFile`,
          value: fileNodeID,
        })
      }
      return Promise.resolve()
    }),
    assetDownloadWorkers
  )
}
