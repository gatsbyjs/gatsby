// @ts-check
import { createClient } from "contentful"
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

// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [
  `children`,
  `contentful_id`,
  `fields`,
  `id`,
  `internal`,
  `parent`,
]

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

export async function sourceNodes(
  {
    actions,
    getNode,
    getNodes,
    getNodesByType,
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
    parentSpan,
  },
  pluginOptions
) {
  const { createNode, touchNode, deleteNode } = actions
  const online = await isOnline()

  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    getNodes().forEach(node => {
      if (node.internal.owner !== `gatsby-source-contentful`) {
        return
      }
      touchNode(node)
      if (node.localFile___NODE) {
        // Prevent GraphQL type inference from crashing on this property
        touchNode(getNode(node.localFile___NODE))
      }
    })

    return
  }

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

  const fetchActivity = reporter.activityTimer(
    `Contentful: Fetch data (${sourceId})`,
    {
      parentSpan,
    }
  )

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
  const CACHE_SYNC_DATA = `contentful-sync-data-${sourceId}`
  const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`

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

  // Actual fetch of data from Contentful
  const {
    currentSyncData,
    tagItems,
    defaultLocale,
    locales: allLocales,
    space,
  } = await fetchContent({ syncToken, pluginConfig, reporter })

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

  // Create a map of up to date entries and assets
  function mergeSyncData(previous, current, deletedEntities) {
    const deleted = new Set(deletedEntities.map(e => e.sys.id))
    const entryMap = new Map()
    previous.forEach(e => !deleted.has(e.sys.id) && entryMap.set(e.sys.id, e))
    current.forEach(e => !deleted.has(e.sys.id) && entryMap.set(e.sys.id, e))
    return [...entryMap.values()]
  }

  let previousSyncData = {
    assets: [],
    entries: [],
  }
  const cachedData = await cache.get(CACHE_SYNC_DATA)

  if (cachedData) {
    previousSyncData = cachedData
  }

  const mergedSyncData = {
    entries: mergeSyncData(
      previousSyncData.entries,
      currentSyncData.entries,
      currentSyncData.deletedEntries
    ),
    assets: mergeSyncData(
      previousSyncData.assets,
      currentSyncData.assets,
      currentSyncData.deletedAssets
    ),
  }

  // @todo based on the sys metadata we should be able to differentiate new and updated entities
  reporter.info(
    `Contentful: ${currentSyncData.entries.length} new/updated entries`
  )
  reporter.info(
    `Contentful: ${currentSyncData.deletedEntries.length} deleted entries`
  )
  reporter.info(`Contentful: ${previousSyncData.entries.length} cached entries`)
  reporter.info(
    `Contentful: ${currentSyncData.assets.length} new/updated assets`
  )
  reporter.info(`Contentful: ${previousSyncData.assets.length} cached assets`)
  reporter.info(
    `Contentful: ${currentSyncData.deletedAssets.length} deleted assets`
  )

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  await cache.set(CACHE_SYNC_DATA, mergedSyncData)
  actions.setPluginStatus({
    [CACHE_SYNC_TOKEN]: nextSyncToken,
  })

  fetchActivity.end()

  // Process data fetch results and turn them into GraphQL entities
  const processingActivity = reporter.activityTimer(
    `Contentful: Process data (${sourceId})`,
    {
      parentSpan,
    }
  )
  processingActivity.start()

  // Store a raw and unresolved copy of the data for caching
  const mergedSyncDataRaw = _.cloneDeep(mergedSyncData)

  // Use the JS-SDK to resolve the entries and assets
  const res = await createClient({
    space: `none`,
    accessToken: `fake-access-token`,
  }).parseEntries({
    items: mergedSyncData.entries,
    includes: {
      assets: mergedSyncData.assets,
      entries: mergedSyncData.entries,
    },
  })

  mergedSyncData.entries = res.items

  // Inject raw API output to rich text fields
  const richTextFieldMap = new Map()
  contentTypeItems.forEach(contentType => {
    richTextFieldMap.set(
      contentType.sys.id,
      contentType.fields
        .filter(field => field.type === `RichText`)
        .map(field => field.id)
    )
  })

  const rawEntries = new Map()
  mergedSyncDataRaw.entries.forEach(rawEntry =>
    rawEntries.set(rawEntry.sys.id, rawEntry)
  )

  mergedSyncData.entries.forEach(entry => {
    const contentTypeId = entry.sys.contentType.sys.id
    const richTextFieldIds = richTextFieldMap.get(contentTypeId)
    if (richTextFieldIds) {
      richTextFieldIds.forEach(richTextFieldId => {
        if (!entry.fields[richTextFieldId]) {
          return
        }
        entry.fields[richTextFieldId] = rawEntries.get(entry.sys.id).fields[
          richTextFieldId
        ]
      })
    }
  })

  const { assets } = mergedSyncData

  const entryList = buildEntryList({
    mergedSyncData,
    contentTypeItems,
  })

  const existingNodes = getNodes().filter(
    n =>
      n.internal.owner === `gatsby-source-contentful` &&
      n.internal.type !== `ContentfulTag`
  )
  existingNodes.forEach(n => touchNode(n))

  reporter.verbose(`Building Contentful reference map`)

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = buildResolvableSet({
    existingNodes,
    entryList,
    assets,
  })

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
    space,
    useNameForId: pluginConfig.get(`useNameForId`),
  })

  reporter.verbose(`Resolving Contentful references`)

  const newOrUpdatedEntries = new Set()
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.add(`${entry.sys.id}___${entry.sys.type}`)
    })
  })

  // Update existing entry nodes that weren't updated but that need reverse
  // links added.
  existingNodes
    .filter(n => newOrUpdatedEntries.has(`${n.id}___${n.sys.type}`))
    .forEach(n => {
      if (foreignReferenceMap[`${n.id}___${n.sys.type}`]) {
        foreignReferenceMap[`${n.id}___${n.sys.type}`].forEach(
          foreignReference => {
            // Add reverse links
            if (n[foreignReference.name]) {
              n[foreignReference.name].push(foreignReference.id)
              // It might already be there so we'll uniquify after pushing.
              n[foreignReference.name] = _.uniq(n[foreignReference.name])
            } else {
              // If is one foreign reference, there can always be many.
              // Best to be safe and put it in an array to start with.
              n[foreignReference.name] = [foreignReference.id]
            }
          }
        )
      }
    })

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
        return getNode(nodeId)
      })
      .filter(node => node)

    localizedNodes.forEach(node => {
      // touchNode first, to populate typeOwners & avoid erroring
      touchNode(node)
      deleteNode(node)
    })
  }

  const { deletedEntries, deletedAssets } = currentSyncData

  if (deletedEntries.length || deletedAssets.length) {
    const deletionActivity = reporter.activityTimer(
      `Contentful: Deleting ${deletedEntries.length} nodes and ${deletedAssets.length} assets (${sourceId})`,
      {
        parentSpan,
      }
    )
    deletionActivity.start()
    deletedEntries.forEach(deleteContentfulNode)
    deletedAssets.forEach(deleteContentfulNode)
    deletionActivity.end()
  }

  const creationActivity = reporter.activityTimer(
    `Contentful: Create nodes (${sourceId})`,
    {
      parentSpan,
    }
  )
  creationActivity.start()

  for (let i = 0; i < contentTypeItems.length; i++) {
    const contentTypeItem = contentTypeItems[i]

    if (entryList[i].length) {
      reporter.info(
        `Creating ${entryList[i].length} Contentful ${
          pluginConfig.get(`useNameForId`)
            ? contentTypeItem.name
            : contentTypeItem.sys.id
        } nodes`
      )
    }

    // A contentType can hold lots of entries which create nodes
    // We wait until all nodes are created and processed until we handle the next one
    // TODO add batching in gatsby-core
    await Promise.all(
      createNodesForContentType({
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
      })
    )
  }

  if (assets.length) {
    reporter.info(`Creating ${assets.length} Contentful asset nodes`)
  }

  for (let i = 0; i < assets.length; i++) {
    // We wait for each asset to be process until handling the next one.
    await Promise.all(
      createAssetNodes({
        assetItem: assets[i],
        createNode,
        createNodeId,
        defaultLocale,
        locales,
        space,
      })
    )
  }

  // Create tags entities
  if (tagItems.length) {
    reporter.info(`Creating ${tagItems.length} Contentful Tag nodes`)

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
  }

  creationActivity.end()

  // @todo add own activity!

  if (pluginConfig.get(`downloadLocal`)) {
    reporter.info(`Download Contentful asset files`)

    await downloadContentfulAssets({
      actions,
      createNodeId,
      store,
      cache,
      getCache,
      getNode,
      getNodesByType,
      reporter,
      assetDownloadWorkers: pluginConfig.get(`assetDownloadWorkers`),
    })
  }
}
