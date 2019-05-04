const ProgressBar = require(`progress`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const bar = new ProgressBar(
  `Downloading Contentful Assets [:bar] :current/:total :elapsed secs :percent`,
  {
    total: 0,
    width: 30,
  }
)

let totalJobs = 0

/**
 * @name downloadContentfulAssets
 * @description Downloads Contentful assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localFile` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */

const downloadContentfulAssets = async gatsbyFunctions => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    store,
    cache,
    getNodes,
  } = gatsbyFunctions

  // Any ContentfulAsset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localFile` to link an asset or not.
  const contentfulAssetNodes = getNodes().filter(
    n =>
      n.internal.owner === `gatsby-source-contentful` &&
      n.internal.type === `ContentfulAsset`
  )

  await Promise.all(
    contentfulAssetNodes.map(async node => {
      totalJobs += 1
      bar.total = totalJobs

      let fileNodeID
      const remoteDataCacheKey = `contentful-asset-${node.contentful_id}`
      const cacheRemoteData = await cache.get(remoteDataCacheKey)
      const url = `http://${node.file.url.slice(2)}`

      // Avoid downloading the asset again if it's been cached
      // Note: Contentful Assets do not provide useful metadata
      // to compare a modified asset to a cached version?
      if (cacheRemoteData) {
        fileNodeID = cacheRemoteData.fileNodeID // eslint-disable-line prefer-destructuring
        touchNode({ nodeId: cacheRemoteData.fileNodeID })
      }

      // If we don't have cached data, download the file
      if (!fileNodeID) {
        try {
          const fileNode = await createRemoteFileNode({
            url,
            store,
            cache,
            createNode,
            createNodeId,
          })

          if (fileNode) {
            bar.tick()
            fileNodeID = fileNode.id

            await cache.set(remoteDataCacheKey, { fileNodeID })
          }
        } catch (err) {
          // Ignore
        }
      }

      if (fileNodeID) {
        node.localFile___NODE = fileNodeID
      }

      return node
    })
  )
}
exports.downloadContentfulAssets = downloadContentfulAssets
