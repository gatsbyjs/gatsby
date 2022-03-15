// @ts-check
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
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
    parentSpan,
  },
  pluginOptions
) {
  const { createNode, touchNode, deleteNode, unstable_createNodeManifest } =
    actions
  const online = await isOnline()

  getNodes().forEach(node => {
    if (node.internal.owner !== `gatsby-source-contentful`) {
      return
    }
    touchNode(node)
    if (node?.fields?.localFile) {
      // Prevent GraphQL type inference from crashing on this property
      touchNode(getNode(node.fields.localFile))
    }
  })

  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    return
  }

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

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

  // Array of all existing Contentful nodes
  const existingNodes = getNodes().filter(
    n =>
      n.internal.owner === `gatsby-source-contentful` &&
      (pluginConfig.get(`enableTags`)
        ? n.internal.type !== `ContentfulTag`
        : true)
  )

  // Report existing, new and updated nodes
  const nodeCounts = {
    newEntry: 0,
    newAsset: 0,
    updatedEntry: 0,
    updatedAsset: 0,
    existingEntry: 0,
    existingAsset: 0,
    deletedEntry: currentSyncData.deletedEntries.length,
    deletedAsset: currentSyncData.deletedAssets.length,
  }
  existingNodes.forEach(node => nodeCounts[`existing${node.sys.type}`]++)
  currentSyncData.entries.forEach(entry =>
    entry.sys.revision === 1 ? nodeCounts.newEntry++ : nodeCounts.updatedEntry++
  )
  currentSyncData.assets.forEach(asset =>
    asset.sys.revision === 1 ? nodeCounts.newAsset++ : nodeCounts.updatedAsset++
  )

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

  const entryList = buildEntryList({ contentTypeItems, currentSyncData })
  const { assets } = currentSyncData

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

  // Update existing entry nodes that weren't updated but that need reverse links added.
  existingNodes
    .filter(n => !newOrUpdatedEntries.has(`${n.id}___${n.sys.type}`))
    .forEach(n => {
      if (
        n.contentful_id &&
        foreignReferenceMap[`${n.contentful_id}___${n.sys.type}`]
      ) {
        foreignReferenceMap[`${n.contentful_id}___${n.sys.type}`].forEach(
          foreignReference => {
            const { name, id } = foreignReference

            // Create new reference field when none exists
            if (!n[name]) {
              n[name] = [id]
              return
            }

            // Add non existing references to reference field
            if (n[name] && !n[name].includes(id)) {
              n[name].push(id)
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

  const creationActivity = reporter.activityTimer(`Contentful: Create nodes`, {
    parentSpan,
  })
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
        unstable_createNodeManifest,
      })
    )
  }

  if (assets.length) {
    reporter.info(`Creating ${assets.length} Contentful asset nodes`)
  }

  const assetNodes = []
  for (let i = 0; i < assets.length; i++) {
    // We wait for each asset to be process until handling the next one.
    assetNodes.push(
      ...(await Promise.all(
        createAssetNodes({
          assetItem: assets[i],
          createNode,
          createNodeId,
          defaultLocale,
          locales,
          space,
          pluginConfig,
        })
      ))
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
}
