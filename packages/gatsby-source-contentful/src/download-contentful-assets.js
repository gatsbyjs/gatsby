// @ts-check
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { createUrl } from "./image-helpers"

/**
 * @name distributeWorkload
 * @param workers A list of async functions to complete
 * @param {number} count The number of task runners to use (see assetDownloadWorkers in config)
 */

async function distributeWorkload(workers, count = 50) {
  const methods = workers.slice()

  async function task() {
    while (methods.length > 0) {
      await methods.pop()()
    }
  }

  await Promise.all(new Array(count).fill(undefined).map(() => task()))
}

/**
 * @name downloadContentfulAssets
 * @description Downloads Contentful assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localFile` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */

export async function downloadContentfulAssets(gatsbyFunctions) {
  const {
    actions: { createNode, touchNode, createNodeField },
    createNodeId,
    store,
    cache,
    reporter,
    assetDownloadWorkers,
    getNode,
    assetNodes,
  } = gatsbyFunctions

  // Any ContentfulAsset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localFile` to link an asset or not.

  const bar = reporter.createProgress(
    `Downloading Contentful Assets`,
    assetNodes.length
  )
  bar.start()
  await distributeWorkload(
    assetNodes.map(node => async () => {
      let fileNodeID
      const { contentful_id: id, node_locale: locale } = node
      const remoteDataCacheKey = `contentful-asset-${id}-${locale}`
      const cacheRemoteData = await cache.get(remoteDataCacheKey)
      if (!node.file) {
        reporter.log(id, locale)
        reporter.warn(`The asset with id: ${id}, contains no file.`)
        return Promise.resolve()
      }
      if (!node.file.url) {
        reporter.warn(
          `The asset with id: ${id} has a file but the file contains no url.`
        )
        return Promise.resolve()
      }
      const url = createUrl(node.file.url)

      // Avoid downloading the asset again if it's been cached
      // Note: Contentful Assets do not provide useful metadata
      // to compare a modified asset to a cached version?
      if (cacheRemoteData) {
        fileNodeID = cacheRemoteData.fileNodeID // eslint-disable-line prefer-destructuring
        touchNode(getNode(cacheRemoteData.fileNodeID))
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
        createNodeField({ node, name: `localFile`, value: fileNodeID })
      }

      return node
    }),
    assetDownloadWorkers
  )
}
