const ProgressBar = require(`progress`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const bar = new ProgressBar(
  `Downloading Contentful Assets [:bar] :current/:total :elapsed secs :percent`,
  {
    total: 0,
    width: 30,
  }
)

/**
 * @name downloadSingleContentfulAsset
 * @description Downloads one Contentful asset to the local filesystem.
 * The asset file will be downloaded and cached. Use `localFile` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */
const downloadSingleContentfulAsset = gatsbyFunctions => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    store,
    cache,
    reporter,
  } = gatsbyFunctions

  return async node => {
    let fileNodeID
    const { contentful_id: id, node_locale: locale } = node
    const remoteDataCacheKey = `contentful-asset-${id}-${locale}`
    const cacheRemoteData = await cache.get(remoteDataCacheKey)
    if (!node.file) {
      reporter.warn(`The asset with id: ${id}, contains no file.`)
      return Promise.resolve()
    }
    if (!node.file.url) {
      reporter.warn(
        `The asset with id: ${id} has a file but the file contains no url.`
      )
      return Promise.resolve()
    }
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
          reporter,
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
  }
}

/**
 * @name downloadContentfulAssets
 * @description Downloads Contentful assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localFile` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */

const downloadContentfulAssets = async gatsbyFunctions => {
  const { getNodes } = gatsbyFunctions

  // Any ContentfulAsset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localFile` to link an asset or not.
  const contentfulAssetNodes = getNodes().filter(
    n =>
      n.internal.owner === `gatsby-source-contentful` &&
      n.internal.type === `ContentfulAsset`
  )

  bar.total = contentfulAssetNodes.length

  const boundDownloadSingleContentfulAsset = downloadSingleContentfulAsset(
    gatsbyFunctions
  )

  const batchSize = 25

  const batchesNum = Math.ceil(contentfulAssetNodes.length / batchSize)

  const batches = Array.from({ length: batchesNum }, (_, index) =>
    contentfulAssetNodes.slice(index * batchSize, (index + 1) * batchSize)
  )

  await batches.reduce(async (prevPromise, batch) => {
    await prevPromise

    return Promise.all(batch.map(boundDownloadSingleContentfulAsset))
  }, Promise.resolve())
}
exports.downloadContentfulAssets = downloadContentfulAssets
