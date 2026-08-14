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

  // There is no cancellation here, so a rejecting worker must not escape while
  // its siblings are still in flight. `downloadContentfulAssets` is awaited
  // from `sourceNodes`, and any surviving task runner keeps calling
  // `createNode` after that lifecycle has returned. `gatsby develop` then sees
  // nodes mutating during query execution, recreates pages, runs the queries
  // again, and after `RECOMPILE_PANIC_LIMIT` rounds aborts with "Panicking
  // because nodes appear to be being changed every time we run queries".
  //
  // Errors are collected and re-raised once all work has settled, so a failed
  // download stays fatal (#24288) without stranding the others. A lone error
  // is rethrown untouched to keep its original message and stack.
  const errors = []

  async function task() {
    while (methods.length > 0) {
      try {
        await methods.pop()()
      } catch (error) {
        errors.push(error)
      }
    }
  }

  await Promise.all(new Array(count).fill(undefined).map(() => task()))

  if (errors.length === 1) {
    throw errors[0]
  }

  if (errors.length > 1) {
    throw new AggregateError(
      errors,
      `${errors.length} of ${workers.length} Contentful asset downloads failed`
    )
  }
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
