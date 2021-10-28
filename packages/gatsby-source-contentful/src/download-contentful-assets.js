// @ts-check
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { createUrl } from "./extend-node-type"
import {
  makeMakeId,
  buildFallbackChain,
  makeGetLocalizedField,
} from "./normalize"

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

export async function downloadContentfulAssets(assets, gatsbyFunctions) {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    store,
    cache,
    reporter,
    assetDownloadWorkers,
    getNode,
    space,
    locales,
    defaultLocale,
  } = gatsbyFunctions

  // Any ContentfulAsset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localFile` to link an asset or not.

  // prepare download tasks
  const downloadTasks = assets.flatMap(assetItem =>
    locales.map(locale => {
      const localesFallback = buildFallbackChain(locales)
      const mId = makeMakeId({
        currentLocale: locale.code,
        defaultLocale,
        createNodeId,
      })
      const getField = makeGetLocalizedField({
        locale,
        localesFallback,
      })

      const id = mId(space.sys.id, assetItem.sys.id, assetItem.sys.type)

      return {
        id,
        remoteDataCacheKey: `contentful-asset-${id}-${locale}`,
        locale,
        file: assetItem.fields.file ? getField(assetItem.fields.file) : null,
      }
    })
  )

  const assetsFileMap = new Map()
  const bar = reporter.createProgress(
    `Downloading Contentful Assets`,
    downloadTasks.length
  )
  bar.start()
  await distributeWorkload(
    downloadTasks.map(
      ({ id, remoteDataCacheKey, file, locale }) =>
        async () => {
          let fileNodeID
          const cacheRemoteData = await cache.get(remoteDataCacheKey)
          if (!file) {
            reporter.log(id, locale)
            reporter.warn(`The asset with id: ${id}, contains no file.`)
            return Promise.resolve()
          }
          if (!file.url) {
            reporter.warn(
              `The asset with id: ${id} has a file but the file contains no url.`
            )
            return Promise.resolve()
          }
          const url = createUrl(file.url)

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
              store,
              cache,
              createNode,
              createNodeId,
              reporter,
            })

            if (fileNode) {
              bar.tick()
              fileNodeID = fileNode.id

              await cache.set(remoteDataCacheKey, { fileNodeID })
            }
          }

          if (fileNodeID) {
            assetsFileMap.set(id, fileNodeID)
          }
          return Promise.resolve()
        }
    ),
    assetDownloadWorkers
  )

  return assetsFileMap
}
