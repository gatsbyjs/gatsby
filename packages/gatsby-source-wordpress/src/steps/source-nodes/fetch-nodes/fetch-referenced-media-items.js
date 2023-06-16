import chunk from "lodash/chunk"
import { getStore } from "~/store"
import atob from "atob"
import filesize from "filesize"
import PQueue from "p-queue"
import { createLocalFileNode } from "../create-nodes/create-local-file-node"
import { paginatedWpNodeFetch, normalizeNode } from "./fetch-nodes-paginated"
import { buildTypeName } from "~/steps/create-schema-customization/helpers"
import fetchGraphql from "~/utils/fetch-graphql"
import { getFileNodeMetaBySourceUrl } from "~/steps/source-nodes/create-nodes/create-local-file-node"
import uniq from "lodash/uniq"
import urlUtil from "url"
import path from "path"
import { getPluginOptions } from "~/utils/get-gatsby-api"
import { formatLogMessage } from "~/utils/format-log-message"
import { getPlaceholderUrlFromMediaItemNode } from "../create-nodes/process-node"

const nodeFetchConcurrency = 2

const concurrency = Number(process.env.GATSBY_CONCURRENT_DOWNLOAD ?? 200)
const adjustedConcurrency = Number(concurrency ?? 200) - nodeFetchConcurrency
const normalizedConcurrency =
  adjustedConcurrency <= nodeFetchConcurrency
    ? concurrency
    : adjustedConcurrency

const mediaFileFetchQueue = new PQueue({
  concurrency: normalizedConcurrency,
  carryoverConcurrencyCount: true,
})

const mediaNodeFetchQueue = new PQueue({
  concurrency: nodeFetchConcurrency,
  carryoverConcurrencyCount: true,
})

const previouslyRetriedPromises = {}

const pushPromiseOntoRetryQueue = ({
  node,
  helpers,
  createContentDigest,
  actions,
  queue,
  retryKey,
  retryPromise,
}) => {
  queue.add(async () => {
    const timesRetried = previouslyRetriedPromises[retryKey] || 0

    if (timesRetried >= 2) {
      // if we've retried this more than once, pause for a sec.
      await new Promise(resolve =>
        setTimeout(() => resolve(), timesRetried * 500)
      )
    }

    try {
      await retryPromise({
        createContentDigest,
        actions,
        helpers,
        node,
        queue,
        retryKey,
        retryPromise,
        timesRetried,
      })
    } catch (error) {
      // Errors that should exit are handled one level down
      // in createLocalFileNode
      //
      // if we haven't reqeued this before,
      // add it to the end of the queue to
      // try once more later
      if (timesRetried < 5) {
        if (timesRetried > 1) {
          helpers.reporter.info(
            `pushing ${retryKey} to the end of the request queue.`
          )

          helpers.reporter.info(
            `Previously retried ${timesRetried} times already.`
          )
        }

        previouslyRetriedPromises[retryKey] = timesRetried + 1

        pushPromiseOntoRetryQueue({
          node,
          helpers,
          createContentDigest,
          actions,
          queue,
          retryKey,
          retryPromise,
        })
      } else {
        helpers.reporter.info(
          `\n\nalready re-queued ${retryKey} 5 times :( sorry.\nTry lowering process.env.GATSBY_CONCURRENT_DOWNLOAD.\nIt's currently set to ${process.env.GATSBY_CONCURRENT_DOWNLOAD}\n\n`
        )
        // we already tried this earlier in the queue
        // no choice but to give up :(
        helpers.reporter.panic(error)
      }
    }
  })
}

export const addImageCDNFieldsToNode = (node, pluginOptions) => {
  if (!node?.__typename?.includes(`MediaItem`)) {
    return node
  }

  const placeholderUrl = getPlaceholderUrlFromMediaItemNode(node, pluginOptions)

  const url = node.sourceUrl || node.mediaItemUrl

  const filename =
    node?.mediaDetails?.file?.split(`/`)?.pop() ||
    path.basename(urlUtil.parse(url).pathname)

  return {
    ...node,
    url,
    contentType: node.contentType,
    mimeType: node.mimeType,
    filename,
    filesize: node?.mediaDetails?.fileSize,
    width: node?.mediaDetails?.width,
    height: node?.mediaDetails?.height,
    placeholderUrl:
      placeholderUrl ?? node?.mediaDetails?.sizes?.[0]?.sourceUrl ?? url,
  }
}

export const createMediaItemNode = async ({
  node,
  helpers,
  createContentDigest,
  actions,
  parentName,
  allMediaItemNodes = [],
}) => {
  const existingNode = await helpers.getNode(node.id)

  if (existingNode) {
    return existingNode
  }

  getStore().dispatch.logger.incrementActivityTimer({
    typeName: `MediaItem`,
    by: 1,
  })

  allMediaItemNodes.push(node)

  let resolveFutureNode
  const futureNode = new Promise(resolve => {
    resolveFutureNode = resolve
  })

  pushPromiseOntoRetryQueue({
    node,
    helpers,
    createContentDigest,
    actions,
    queue: mediaFileFetchQueue,
    retryKey: node.mediaItemUrl,
    retryPromise: async ({
      createContentDigest,
      actions,
      helpers,
      node,
      retryKey,
      timesRetried,
    }) => {
      const fetchTimeout = setTimeout(() => {
        helpers.reporter.log(
          formatLogMessage(
            `Fetching ${
              node.mediaItemUrl
            } is taking a long time time (longer than 15 seconds). This file is ${filesize(
              node.fileSize
            )}`
          )
        )
      }, 15000)

      const pluginOptions = getPluginOptions()

      const { createFileNodes } = pluginOptions.type.MediaItem

      const localFileNode = createFileNodes
        ? await createLocalFileNode({
            mediaItemNode: node,
            helpers,
            parentName,
          })
        : null

      clearTimeout(fetchTimeout)

      if (timesRetried > 1) {
        helpers.reporter.info(
          `Successfully fetched ${retryKey} after retrying ${timesRetried} times`
        )
      }

      node = addImageCDNFieldsToNode(
        {
          ...node,
          parent: null,
          internal: {
            contentDigest: createContentDigest(node),
            type: buildTypeName(`MediaItem`),
          },
        },
        pluginOptions
      )

      if (localFileNode?.id) {
        node.localFile = {
          id: localFileNode?.id,
        }
      }

      const normalizedNode = normalizeNode({ node, nodeTypeName: `MediaItem` })

      await actions.createNode(normalizedNode)
      return resolveFutureNode(node)
    },
  })

  return futureNode
}

const urlToFileExtension = url => {
  const { pathname } = urlUtil.parse(url)

  const fileExtension = path.extname(pathname)

  return fileExtension
}

export const stripImageSizesFromUrl = url => {
  const fileExtension = urlToFileExtension(url)

  const imageSizesPattern = new RegExp(
    // eslint-disable-next-line no-useless-escape
    `(?:[-_]([0-9]+)x([0-9]+))${fileExtension ? `\.${fileExtension}` : ``}`
  )

  let urlWithoutSizes = url.replace(imageSizesPattern, ``)

  if (urlWithoutSizes !== url && fileExtension) {
    urlWithoutSizes = `${urlWithoutSizes}${fileExtension}`
  }

  return urlWithoutSizes
}

const createScaledImageUrl = url => {
  const fileExtension = urlToFileExtension(url)

  const isAlreadyScaled = url.includes(`-scaled${fileExtension || ``}`)

  if (isAlreadyScaled) {
    return url
  }

  let scaledUrl

  if (fileExtension) {
    scaledUrl = url.replace(fileExtension, `-scaled${fileExtension}`)
  } else {
    scaledUrl = `${url}-scaled`
  }

  return scaledUrl
}

// takes an array of image urls and returns them + additional urls if
// any of the provided image urls contain what appears to be an image resize signifier
// for ex https://site.com/wp-content/uploads/01/your-image-500x1000.jpeg
// that will add https://site.com/wp-content/uploads/01/your-image.jpeg to the array
// this is necessary because we can only get image nodes by the full source url.
// simply removing image resize signifiers from all urls would be a mistake since
// someone could upload a full-size image that contains that pattern - so the full
// size url would have 500x1000 in it, and removing it would make it so we can never
// fetch this image node.
const processAndDedupeImageUrls = urls =>
  uniq(
    urls.reduce((accumulator, url) => {
      const scaledUrl = createScaledImageUrl(url)
      accumulator.push(scaledUrl)

      const strippedUrl = stripImageSizesFromUrl(url)

      // if the url had no image sizes, don't do anything special
      if (strippedUrl === url) {
        return accumulator
      }

      accumulator.push(strippedUrl)

      const scaledStrippedUrl = createScaledImageUrl(strippedUrl)
      accumulator.push(scaledStrippedUrl)

      return accumulator
    }, urls)
  )

export const fetchMediaItemsBySourceUrl = async ({
  mediaItemUrls,
  selectionSet,
  builtFragments,
  createContentDigest,
  actions,
  helpers,
  allMediaItemNodes = [],
}) => {
  const processedMediaItemUrls = processAndDedupeImageUrls(mediaItemUrls)

  const { cachedMediaItemNodeIds, uncachedMediaItemUrls } =
    processedMediaItemUrls.reduce(
      (accumulator, url) => {
        const { id } = getFileNodeMetaBySourceUrl(url) || {}

        // if we have a cached image and we haven't already recorded this cached image
        if (id && !accumulator.cachedMediaItemNodeIds.includes(id)) {
          // save it
          accumulator.cachedMediaItemNodeIds.push(id)
        } else if (!id) {
          // otherwise we need to fetch this media item by url
          accumulator.uncachedMediaItemUrls.push(url)
        }

        return accumulator
      },
      { cachedMediaItemNodeIds: [], uncachedMediaItemUrls: [] }
    )

  // take our previously cached id's and get nodes for them
  const previouslyCachedMediaItemNodes = await Promise.all(
    cachedMediaItemNodeIds.map(async nodeId => {
      const node = await helpers.getNode(nodeId)

      const parentNode =
        node?.internal?.type === `File` && node?.parent
          ? helpers.getNode(node.parent)
          : null

      return parentNode || node
    })
  )

  const {
    schema: { perPage },
  } = getPluginOptions()

  // chunk up all our uncached media items
  const mediaItemUrlsPages = chunk(uncachedMediaItemUrls, perPage)

  // since we're using an async queue, we need a way to know when it's finished
  // we pass this resolve function into the queue function so it can let us
  // know when it's finished

  // we have no media items to fetch,
  // so we need to resolve this promise
  // otherwise it will never resolve below.
  if (!mediaItemUrlsPages.length) {
    return Promise.resolve(previouslyCachedMediaItemNodes)
  }

  const allPromises = []
  // for all the images we don't have cached, loop through and get them all
  for (const [index, sourceUrls] of mediaItemUrlsPages.entries()) {
    const curPromise = new Promise(resolve => {
      pushPromiseOntoRetryQueue({
        helpers,
        createContentDigest,
        actions,
        queue: mediaNodeFetchQueue,
        retryKey: `Media Item by sourceUrl query #${index}, digest: ${createContentDigest(
          sourceUrls.join()
        )}`,
        retryPromise: async () => {
          const query = /* GraphQL */ `
            query MEDIA_ITEMS {
              ${sourceUrls
                .map(
                  (sourceUrl, index) => /* GraphQL */ `
                mediaItem__index_${index}: mediaItem(id: "${sourceUrl}", idType: SOURCE_URL) {
                  ...MediaItemFragment
                }
              `
                )
                .join(` `)}
            }

            fragment MediaItemFragment on MediaItem {
              ${selectionSet}
            }

            ${builtFragments || ``}
          `

          const { data } = await fetchGraphql({
            query,
            variables: {
              first: perPage,
              after: null,
            },
            errorContext: `Error occurred while fetching "MediaItem" nodes in inline html.`,
          })

          // since we're getting each media item on it's single node root field
          // we just needs the values of each property in the response
          // anything that returns null is because we tried to get the source url
          // plus the source url minus resize patterns. So there will be nulls
          // since only the full source url will return data
          const thisPagesNodes = Object.values(data).filter(Boolean)

          // take the WPGraphQL nodes we received and create Gatsby nodes out of them
          const nodes = await Promise.all(
            thisPagesNodes.map(node =>
              createMediaItemNode({
                node,
                helpers,
                createContentDigest,
                actions,
                allMediaItemNodes,
                parentName: `Fetching referenced MediaItem nodes by sourceUrl`,
              })
            )
          )

          nodes.forEach((node, index) => {
            if (!node || !node?.localFile?.id) {
              return
            }

            // this is how we're caching nodes we've previously fetched.
            getStore().dispatch.imageNodes.pushNodeMeta({
              id: node.localFile.id,
              sourceUrl: sourceUrls[index],
              modifiedGmt: node.modifiedGmt,
            })
          })

          resolve(nodes)
        },
      })
    })
    allPromises.push(curPromise)
  }

  await mediaNodeFetchQueue.onIdle()
  await mediaFileFetchQueue.onIdle()

  const allResults = await Promise.all(allPromises)
  return [...previouslyCachedMediaItemNodes, ...allResults.flat()]
}

export const fetchMediaItemsById = async ({
  mediaItemIds,
  settings,
  url,
  selectionSet,
  builtFragments,
  createContentDigest,
  actions,
  helpers,
  typeInfo,
}) => {
  const newMediaItemIds = mediaItemIds.filter(id => !helpers.getNode(id))

  const {
    schema: { perPage },
  } = getPluginOptions()

  const chunkedIds = chunk(newMediaItemIds, perPage)

  if (!newMediaItemIds.length) {
    return Promise.resolve([])
  }

  const allMediaItemNodes = []
  const allPromises = []

  for (const [index, relayIds] of chunkedIds.entries()) {
    const curPromise = new Promise(resolve => {
      pushPromiseOntoRetryQueue({
        helpers,
        createContentDigest,
        actions,
        queue: mediaNodeFetchQueue,
        retryKey: `Media Item query #${index}, digest: ${createContentDigest(
          relayIds.join()
        )}`,
        retryPromise: async () => {
          // relay id's are base64 encoded from strings like attachment:89381
          // where 89381 is the id we want for our query
          // so we split on the : and get the last item in the array, which is the id
          // once we can get a list of media items by relay id's, we can remove atob
          const ids = relayIds.map(id => atob(id).split(`:`).slice(-1)[0])

          const query = `
          query MEDIA_ITEMS($in: [ID]) {
            mediaItems(first: ${perPage}, where:{ in: $in }) {
              nodes {
                ${selectionSet}
              }
            }
          }

          ${builtFragments || ``}
        `
          const allNodesOfContentType = await paginatedWpNodeFetch({
            first: perPage,
            contentTypePlural: typeInfo.pluralName,
            nodeTypeName: typeInfo.nodesTypeName,
            query,
            url,
            helpers,
            settings,
            in: ids,
            // this allows us to retry-on-end-of-queue
            throwFetchErrors: true,
          })

          const nodes = await Promise.all(
            allNodesOfContentType.map(node =>
              createMediaItemNode({
                node,
                helpers,
                createContentDigest,
                actions,
                allMediaItemNodes,
                referencedMediaItemNodeIds: mediaItemIds,
                parentName: `Fetching referenced MediaItem nodes by id`,
              })
            )
          )

          resolve(nodes)
        },
      })
    })
    allPromises.push(curPromise)
  }

  await mediaNodeFetchQueue.onIdle()
  await mediaFileFetchQueue.onIdle()

  const allResults = await Promise.all(allPromises)
  return allResults.flat()
}

export default async function fetchReferencedMediaItemsAndCreateNodes({
  referencedMediaItemNodeIds,
  mediaItemUrls,
}) {
  const state = getStore().getState()
  const queryInfo = state.remoteSchema.nodeQueries.mediaItems
  const { helpers, pluginOptions } = state.gatsbyApi

  // don't fetch media items if they are excluded via pluginOptions
  if (pluginOptions.type?.MediaItem?.exclude) {
    return []
  }

  const { createContentDigest, actions } = helpers
  const { url } = pluginOptions
  const { typeInfo, settings, selectionSet, builtFragments } = queryInfo

  let createdNodes = []

  if (referencedMediaItemNodeIds?.length) {
    const nodesSourcedById = await fetchMediaItemsById({
      mediaItemIds: referencedMediaItemNodeIds,
      settings,
      url,
      selectionSet,
      builtFragments,
      createContentDigest,
      actions,
      helpers,
      typeInfo,
    })

    createdNodes = nodesSourcedById
  }

  if (mediaItemUrls?.length) {
    const nodesSourcedByUrl = await fetchMediaItemsBySourceUrl({
      mediaItemUrls,
      settings,
      url,
      selectionSet,
      builtFragments,
      createContentDigest,
      actions,
      helpers,
      typeInfo,
    })

    createdNodes = [...createdNodes, ...nodesSourcedByUrl]
  }

  return createdNodes.filter(Boolean)
}
