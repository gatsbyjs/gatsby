// @ts-check
import { getDataStore } from "gatsby/dist/datastore"
import { hasFeature } from "gatsby-plugin-utils/has-feature"
import isOnline from "is-online"
import _ from "lodash"
import { downloadContentfulAssets } from "./download-contentful-assets"
import { fetchContent } from "./fetch"
import {
  buildEntryList,
  buildForeignReferenceMap,
  buildResolvableSet,
  createAssetNodes,
  createNodesForContentType,
  makeId,
} from "./normalize"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"

const conflictFieldPrefix = `contentful`

// restrictedNodeFields from here https://www.gatsbyjs.com/docs/node-interface/
const restrictedNodeFields = [
  `children`,
  `contentful_id`,
  `fields`,
  `id`,
  `internal`,
  `parent`,
]

const CONTENT_DIGEST_COUNTER_SEPARATOR = `_COUNT_`

let memLoggedCount = 0
function logMemUsage() {
  const { rss, heapTotal } = process.memoryUsage()
  console.log(
    `${rss / 1024 / 1024}MB rss and ${
      heapTotal / 1024 / 1024
    }MB heapTotal currently allocated (checked ${++memLoggedCount} times)`
  )
}

/***
 * Localization algorithm
 *
 * 1. Make list of all resolvable IDs worrying just about the default ids not
 * localized ids
 * 2. Make mapping between ids, again not worrying about localization.
 * 3. When creating entries and assets, make the most localized version
 * possible for each localized node i.e. get the localized field if it exists
 * or the fallback field or the default field.
 */

// Array of all existing Contentful nodes. Make it global and incrementally update it because it's hella slow to recreate this on every data update for large sites.
const existingNodes = []
let isFirstSourceNodesCallOfCurrentNodeProcess = true
export async function sourceNodes(
  {
    actions,
    getNode,
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
    parentSpan,
  },
  pluginOptions
) {
  const hasTouchNodeOptOut = hasFeature(`touchnode-optout`)
  const needToTouchNodes =
    !hasTouchNodeOptOut && isFirstSourceNodesCallOfCurrentNodeProcess

  logMemUsage()
  const {
    createNode: originalCreateNode,
    deleteNode: originalDeleteNode,
    touchNode,
    unstable_createNodeManifest,
    disableNodeTypeGarbageCollection,
  } = actions

  const online = await isOnline()

  logMemUsage()

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

  const CREATED_TYPENAMES = `contentful-created-typenames-${sourceId}`
  const createdTypeNames = new Set((await cache.get(CREATED_TYPENAMES)) || [])

  // Report existing, new and updated nodes
  const nodeCounts = {
    newEntry: 0,
    newAsset: 0,
    updatedEntry: 0,
    updatedAsset: 0,
    existingEntry: 0,
    existingAsset: 0,
  }

  let allNodesLoopCount = 0

  logMemUsage()
  if (isFirstSourceNodesCallOfCurrentNodeProcess) {
    console.log(`getting existing nodes`)
    for (const typeName of createdTypeNames) {
      const typeNodes = getDataStore().iterateNodesByType(typeName)

      for (const node of typeNodes) {
        if (needToTouchNodes) {
          touchNode(node)

          if (node?.fields?.includes(`localFile`)) {
            // Prevent GraphQL type inference from crashing on this property
            touchNode(getNode(getNode(node.id).fields.localFile))
          }
        }

        if (++allNodesLoopCount % 5000 === 0) {
          // dont block the event loop
          await new Promise(resolve => setImmediate(() => resolve(null)))
        }

        // @ts-ignore
        nodeCounts[`existing${node.sys.type}`]++

        if (
          pluginConfig.get(`enableTags`) &&
          node.internal.type === `ContentfulTag`
        ) {
          continue
        }

        existingNodes.push(node)
      }

      // dont block the event loop
      await new Promise(resolve => setImmediate(() => resolve(null)))
    }
  }
  logMemUsage()

  isFirstSourceNodesCallOfCurrentNodeProcess = false

  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    return
  }

  // wrap createNode so we can track the typenames of nodes we create
  // and call disableNodeTypeGarbageCollection for them
  const createNode = node => {
    if (node?.internal?.type) {
      createdTypeNames.add(node.internal.type)
    } else {
      reporter.info(node)
      throw new Error(`Contentful Node is missing internal.type`)
    }

    if (!isFirstSourceNodesCallOfCurrentNodeProcess) {
      const existingNodeIndex = existingNodes.findIndex(
        existingNode => existingNode.id === node.id
      )

      if (existingNodeIndex !== -1) {
        existingNodes[existingNodeIndex] = node
      } else {
        existingNodes.push(node)
      }
    }

    return originalCreateNode(node)
  }

  const deleteNode = node => {
    if (!isFirstSourceNodesCallOfCurrentNodeProcess) {
      const existingNodeIndex = existingNodes.findIndex(
        existingNode => existingNode.id === node.id
      )

      if (existingNodeIndex !== -1) {
        delete existingNodes[existingNodeIndex]
      }
    }

    return originalDeleteNode(node)
  }

  const fetchActivity = reporter.activityTimer(`Contentful: Fetch data`, {
    parentSpan,
  })

  // If the user knows they are offline, serve them cached result
  // For prod builds though always fail if we can't get the latest data
  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    reporter.info(`Using Contentful Offline cache ⚠️`)
    reporter.info(
      `Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files`
    )

    return
  }
  if (process.env.GATSBY_CONTENTFUL_OFFLINE) {
    reporter.info(
      `Note: \`GATSBY_CONTENTFUL_OFFLINE\` was set but it either was not \`true\`, we _are_ online, or we are in production mode, so the flag is ignored.`
    )
  }

  fetchActivity.start()

  const CACHE_SYNC_TOKEN = `contentful-sync-token-${sourceId}`
  const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`
  const CACHE_FOREIGN_REFERENCE_MAP_STATE = `contentful-foreign-reference-map-state-${sourceId}`

  /*
   * Subsequent calls of Contentfuls sync API return only changed data.
   *
   * In some cases, especially when using rich-text fields, there can be data
   * missing from referenced entries. This breaks the reference matching.
   *
   * To workround this, we cache the initial sync data and merge it
   * with all data from subsequent syncs. Afterwards the references get
   * resolved via the Contentful JS SDK.
   */
  const syncToken =
    store.getState().status.plugins?.[`gatsby-source-contentful`]?.[
      CACHE_SYNC_TOKEN
    ]

  logMemUsage()
  // Actual fetch of data from Contentful
  const {
    currentSyncData,
    tagItems,
    defaultLocale,
    locales: allLocales,
    space,
  } = await fetchContent({ syncToken, pluginConfig, reporter })
  logMemUsage()
  const contentTypeItems = await cache.get(CACHE_CONTENT_TYPES)

  const locales = allLocales.filter(pluginConfig.get(`localeFilter`))
  reporter.verbose(
    `Default locale: ${defaultLocale}. All locales: ${allLocales
      .map(({ code }) => code)
      .join(`, `)}`
  )
  if (allLocales.length !== locales.length) {
    reporter.verbose(
      `After plugin.options.localeFilter: ${locales
        .map(({ code }) => code)
        .join(`, `)}`
    )
  }
  if (locales.length === 0) {
    reporter.panic({
      id: CODES.LocalesMissing,
      context: {
        sourceMessage: `Please check if your localeFilter is configured properly. Locales '${allLocales
          .map(item => item.code)
          .join(`,`)}' were found but were filtered down to none.`,
      },
    })
  }

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  actions.setPluginStatus({
    [CACHE_SYNC_TOKEN]: nextSyncToken,
  })

  fetchActivity.end()

  // Process data fetch results and turn them into GraphQL entities
  const processingActivity = reporter.activityTimer(
    `Contentful: Process data`,
    {
      parentSpan,
    }
  )
  processingActivity.start()

  logMemUsage()

  if (currentSyncData) {
    nodeCounts.deletedEntry = currentSyncData.deletedEntries.length
    nodeCounts.deletedAsset = currentSyncData.deletedAssets.length

    currentSyncData.entries.forEach(entry =>
      entry.sys.revision === 1
        ? nodeCounts.newEntry++
        : nodeCounts.updatedEntry++
    )
    currentSyncData.assets.forEach(asset =>
      asset.sys.revision === 1
        ? nodeCounts.newAsset++
        : nodeCounts.updatedAsset++
    )
  }

  reporter.info(`Contentful: ${nodeCounts.newEntry} new entries`)
  reporter.info(`Contentful: ${nodeCounts.updatedEntry} updated entries`)
  reporter.info(`Contentful: ${nodeCounts.deletedEntry} deleted entries`)
  reporter.info(
    `Contentful: ${nodeCounts.existingEntry / locales.length} cached entries`
  )
  reporter.info(`Contentful: ${nodeCounts.newAsset} new assets`)
  reporter.info(`Contentful: ${nodeCounts.updatedAsset} updated assets`)
  reporter.info(
    `Contentful: ${nodeCounts.existingAsset / locales.length} cached assets`
  )
  reporter.info(`Contentful: ${nodeCounts.deletedAsset} deleted assets`)

  reporter.verbose(`Building Contentful reference map`)

  logMemUsage()
  const entryList = buildEntryList({ contentTypeItems, currentSyncData })

  // @ts-ignore
  const { assets } = currentSyncData

  console.log(`contentful existingNodes.length`, existingNodes.length)
  console.log(`contentful entryList.length`, entryList.length)
  // Create map of resolvable ids so we can check links against them while creating
  // links.
  console.log(`contentful start buildResolvableSet`)
  logMemUsage()
  let resolvable = buildResolvableSet({
    existingNodes,
    entryList,
    assets,
  })

  console.log(`contentful end buildResolvableSet`)
  logMemUsage()
  console.log(`contentful resolvable.size`, resolvable.size)

  const previousForeignReferenceMapState = await cache.get(
    CACHE_FOREIGN_REFERENCE_MAP_STATE
  )

  console.log(`contentful start buildForeignReferenceMap`)
  logMemUsage()
  // Build foreign reference map before starting to insert any nodes.
  const foreignReferenceMapState = buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
    space,
    useNameForId: pluginConfig.get(`useNameForId`),
    previousForeignReferenceMapState,
    deletedEntries: currentSyncData?.deletedEntries,
  })
  logMemUsage()
  console.log(`contentful end buildForeignReferenceMap`)

  await cache.set(CACHE_FOREIGN_REFERENCE_MAP_STATE, foreignReferenceMapState)
  console.log(
    `contentful end cache.set(CACHE_FOREIGN_REFERENCE_MAP_STATE, foreignReferenceMapState)`
  )
  logMemUsage()

  const foreignReferenceMap = foreignReferenceMapState.backLinks

  reporter.verbose(`Resolving Contentful references`)

  let newOrUpdatedEntries = new Set()
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.add(`${entry.sys.id}___${entry.sys.type}`)
    })
  })
  logMemUsage()
  console.log(`contentful newOrUpdatedEntries.size`, newOrUpdatedEntries.size)

  const { deletedEntries, deletedAssets } = currentSyncData
  const deletedEntryGatsbyReferenceIds = new Set()

  function deleteContentfulNode(node) {
    const normalizedType = node.sys.type.startsWith(`Deleted`)
      ? node.sys.type.substring(`Deleted`.length)
      : node.sys.type

    const localizedNodes = locales
      .map(locale => {
        const nodeId = createNodeId(
          makeId({
            spaceId: space.sys.id,
            id: node.sys.id,
            type: normalizedType,
            currentLocale: locale.code,
            defaultLocale,
          })
        )
        // Gather deleted node ids to remove them later on
        deletedEntryGatsbyReferenceIds.add(nodeId)
        return getNode(nodeId)
      })
      .filter(node => node)

    localizedNodes.forEach(node => {
      // touchNode first, to populate typeOwners & avoid erroring
      touchNode(node)
      deleteNode(node)
    })
  }

  if (deletedEntries.length || deletedAssets.length) {
    const deletionActivity = reporter.activityTimer(
      `Contentful: Deleting nodes and assets`,
      {
        parentSpan,
      }
    )
    deletionActivity.start()
    deletedEntries.forEach(deleteContentfulNode)
    deletedAssets.forEach(deleteContentfulNode)
    deletionActivity.end()
  }

  // Update existing entry nodes that weren't updated but that need reverse links added or removed.
  let existingNodesThatNeedReverseLinksUpdateInDatastore = new Set()
  logMemUsage()
  console.log(
    `start building existingNodesThatNeedReverseLinksUpdateInDatastore`
  )
  existingNodes
    .filter(
      n =>
        n.sys.type === `Entry` &&
        !newOrUpdatedEntries.has(`${n.id}___${n.sys.type}`) &&
        !deletedEntryGatsbyReferenceIds.has(n.id)
    )
    .forEach(n => {
      if (
        n.contentful_id &&
        foreignReferenceMap[`${n.contentful_id}___${n.sys.type}`]
      ) {
        foreignReferenceMap[`${n.contentful_id}___${n.sys.type}`].forEach(
          foreignReference => {
            const { name, id: contentfulId, type, spaceId } = foreignReference

            const nodeId = createNodeId(
              makeId({
                spaceId,
                id: contentfulId,
                type,
                currentLocale: n.node_locale,
                defaultLocale,
              })
            )

            // Create new reference field when none exists
            if (!n[name]) {
              existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              n[name] = [nodeId]
              return
            }

            // Add non existing references to reference field
            if (n[name] && !n[name].includes(nodeId)) {
              existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              n[name].push(nodeId)
            }
          }
        )
      }

      // Remove references to deleted nodes
      if (n.contentful_id && deletedEntryGatsbyReferenceIds.size) {
        Object.keys(n).forEach(name => {
          // @todo Detect reference fields based on schema. Should be easier to achieve in the upcoming version.
          if (!name.endsWith(`___NODE`)) {
            return
          }
          if (Array.isArray(n[name])) {
            n[name] = n[name].filter(referenceId => {
              const shouldRemove =
                deletedEntryGatsbyReferenceIds.has(referenceId)
              if (shouldRemove) {
                existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              }
              return !shouldRemove
            })
          } else {
            const referenceId = n[name]
            if (deletedEntryGatsbyReferenceIds.has(referenceId)) {
              existingNodesThatNeedReverseLinksUpdateInDatastore.add(n)
              n[name] = null
            }
          }
        })
      }
    })

  logMemUsage()
  console.log(`free existingNodes and newOrUpdatedEntries`)
  // attempt to convince node to garbage collect
  // @ts-ignore
  newOrUpdatedEntries = undefined
  await new Promise(res => {
    setImmediate(() => {
      res(null)
    })
  })
  logMemUsage()

  // We need to call `createNode` on nodes we modified reverse links on,
  // otherwise changes won't actually persist
  if (existingNodesThatNeedReverseLinksUpdateInDatastore.size) {
    console.log(
      `contentful existingNodesThatNeedReverseLinksUpdateInDatastore.size`,
      existingNodesThatNeedReverseLinksUpdateInDatastore.size
    )
    logMemUsage()
    for (const node of existingNodesThatNeedReverseLinksUpdateInDatastore) {
      function addChildrenToList(node, nodeList = [node]) {
        for (const childNodeId of node?.children ?? []) {
          const childNode = getNode(childNodeId)
          if (
            childNode &&
            childNode.internal.owner === `gatsby-source-contentful`
          ) {
            nodeList.push(childNode)
            addChildrenToList(childNode)
          }
        }
        return nodeList
      }

      const nodeAndDescendants = addChildrenToList(node)
      for (const nodeToUpdateOriginal of nodeAndDescendants) {
        // We should not mutate original node as Gatsby will still
        // compare against what's in in-memory weak cache, so we
        // clone original node to ensure reference identity is not possible
        const nodeToUpdate = _.cloneDeep(nodeToUpdateOriginal)
        // We need to remove properties from existing fields
        // that are reserved and managed by Gatsby (`.internal.owner`, `.fields`).
        // Gatsby automatically will set `.owner` it back
        nodeToUpdate.internal.owner = undefined
        // `.fields` need to be created with `createNodeField` action, we can't just re-add them.
        // Other plugins (or site itself) will have opportunity to re-generate them in `onCreateNode` lifecycle.
        // Contentful content nodes are not using `createNodeField` so it's safe to delete them.
        // (Asset nodes DO use `createNodeField` for `localFile` and if we were updating those, then
        // we would also need to restore that field ourselves after re-creating a node)
        nodeToUpdate.fields = undefined // plugin adds node field on asset nodes which don't have reverse links

        // We add or modify counter postfix to contentDigest
        // to make sure Gatsby treat this as data update
        let counter
        const [initialContentDigest, counterStr] =
          nodeToUpdate.internal.contentDigest.split(
            CONTENT_DIGEST_COUNTER_SEPARATOR
          )

        if (counterStr) {
          counter = parseInt(counterStr, 10)
        }

        if (!counter || isNaN(counter)) {
          counter = 1
        } else {
          counter++
        }

        nodeToUpdate.internal.contentDigest = `${initialContentDigest}${CONTENT_DIGEST_COUNTER_SEPARATOR}${counter}`
        createNode(nodeToUpdate)
      }
    }
    logMemUsage()
  }

  // @ts-ignore
  existingNodesThatNeedReverseLinksUpdateInDatastore = undefined
  await new Promise(res => {
    setImmediate(() => {
      res(null)
    })
  })

  const creationActivity = reporter.activityTimer(`Contentful: Create nodes`, {
    parentSpan,
  })
  creationActivity.start()

  logMemUsage()
  for (let i = 0; i < contentTypeItems.length; i++) {
    const contentTypeItem = contentTypeItems[i]

    const timer =
      entryList[i].length > 0
        ? reporter.activityTimer(
            `Creating ${entryList[i].length} Contentful ${
              pluginConfig.get(`useNameForId`)
                ? contentTypeItem.name
                : contentTypeItem.sys.id
            } nodes`
          )
        : null

    if (timer) {
      timer.start()
    }

    // A contentType can hold lots of entries which create nodes
    // We wait until all nodes are created and processed until we handle the next one
    await createNodesForContentType({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      createNodeId,
      getNode,
      resolvable,
      foreignReferenceMap,
      defaultLocale,
      locales,
      space,
      useNameForId: pluginConfig.get(`useNameForId`),
      pluginConfig,
      unstable_createNodeManifest,
    })

    if (timer) {
      timer.end()
      logMemUsage()
    }

    // attempt to convince node to garbage collect
    contentTypeItems[i] = undefined
    entryList[i] = undefined
    await new Promise(res => {
      setImmediate(() => res(null))
    })
  }

  // attempt to convince node to garbage collect
  // @ts-ignore
  resolvable = undefined
  await new Promise(res => {
    setImmediate(() => res(null))
  })

  const assetTimer = reporter.createProgress(`Creating Contentful asset nodes`)

  assetTimer.total = assets.length
  assetTimer.start()

  const assetNodes = []
  for (let i = 0; i < assets.length; i++) {
    // We wait for each asset to be process until handling the next one.
    assetNodes.push(
      ...(await createAssetNodes({
        assetItem: assets[i],
        createNode,
        createNodeId,
        defaultLocale,
        locales,
        space,
        pluginConfig,
      }))
    )

    if (i % 10000 === 0) {
      logMemUsage()
    }

    assets[i] = undefined
    if (i % 100 === 0) {
      await new Promise(res => {
        setImmediate(() => res(null))
      })
    }
    assetTimer.tick()
  }

  assetTimer.end()

  await new Promise(res => {
    setImmediate(() => res(null))
  })

  logMemUsage()

  // Create tags entities
  if (tagItems.length) {
    reporter.info(`Creating ${tagItems.length} Contentful Tag nodes`)

    logMemUsage()
    for (const tag of tagItems) {
      await createNode({
        id: createNodeId(`ContentfulTag__${space.sys.id}__${tag.sys.id}`),
        name: tag.name,
        contentful_id: tag.sys.id,
        internal: {
          type: `ContentfulTag`,
          contentDigest: tag.sys.updatedAt,
        },
      })
    }
    logMemUsage()
  }

  creationActivity.end()

  // Download asset files to local fs
  if (pluginConfig.get(`downloadLocal`)) {
    await downloadContentfulAssets({
      assetNodes,
      actions,
      createNodeId,
      store,
      cache,
      getCache,
      getNode,
      reporter,
      assetDownloadWorkers: pluginConfig.get(`assetDownloadWorkers`),
    })
  }

  if (hasTouchNodeOptOut) {
    createdTypeNames.forEach(typeName => {
      disableNodeTypeGarbageCollection(typeName)
    })
  }

  await cache.set(CREATED_TYPENAMES, [...createdTypeNames])
}
