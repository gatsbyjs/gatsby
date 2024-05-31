// @ts-check
import _ from "lodash"
import {
  addNodeToExistingNodesCache,
  getExistingCachedNodes,
  removeNodeFromExistingNodesCache,
} from "./backreferences"
import { untilNextEventLoopTick } from "./utils"

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
import { hasFeature } from "gatsby-plugin-utils/has-feature"

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

async function isOnline() {
  return (await import(`is-online`)).default()
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
  const {
    createNode: originalCreateNode,
    touchNode,
    deleteNode: originalDeleteNode,
    unstable_createNodeManifest,
    enableStatefulSourceNodes,
  } = actions

  if (hasFeature(`stateful-source-nodes`)) {
    enableStatefulSourceNodes()
  }

  const pluginConfig = createPluginConfig(pluginOptions)

  // wrap createNode so we can cache them in memory for faster lookups when finding backreferences
  const createNode = node => {
    addNodeToExistingNodesCache(node)

    return originalCreateNode(node)
  }

  const deleteNode = node => {
    removeNodeFromExistingNodesCache(node)

    return originalDeleteNode(node)
  }

  // Array of all existing Contentful nodes
  const { existingNodes, memoryNodeCountsBySysType } =
    await getExistingCachedNodes({
      actions,
      getNode,
      pluginConfig,
    })

  // If the user knows they are offline, serve them cached result
  // For prod builds though always fail if we can't get the latest data
  if (
    !(await isOnline()) &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    reporter.info(`Using Contentful Offline cache ⚠️`)
    reporter.info(
      `Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files`
    )

    return
  } else if (process.env.GATSBY_CONTENTFUL_OFFLINE) {
    reporter.info(
      `Note: \`GATSBY_CONTENTFUL_OFFLINE\` was set but it either was not \`true\`, we _are_ online, or we are in production mode, so the flag is ignored.`
    )
  }

  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

  const fetchActivity = reporter.activityTimer(`Contentful: Fetch data`, {
    parentSpan,
  })

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
  const isCachedBuild = !!syncToken

  // Actual fetch of data from Contentful
  const {
    currentSyncData,
    tagItems,
    defaultLocale,
    locales: allLocales = [],
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
  const nextSyncToken = currentSyncData?.nextSyncToken

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

  // Report existing, new and updated nodes
  const nodeCounts = {
    newEntry: 0,
    newAsset: 0,
    updatedEntry: 0,
    updatedAsset: 0,
    deletedEntry: currentSyncData?.deletedEntries?.length || 0,
    deletedAsset: currentSyncData?.deletedAssets?.length || 0,
  }

  currentSyncData?.entries?.forEach(entry =>
    entry.sys.revision === 1 ? nodeCounts.newEntry++ : nodeCounts.updatedEntry++
  )
  currentSyncData?.assets?.forEach(asset =>
    asset.sys.revision === 1 ? nodeCounts.newAsset++ : nodeCounts.updatedAsset++
  )

  reporter.info(`Contentful: ${nodeCounts.newEntry} new entries`)
  reporter.info(`Contentful: ${nodeCounts.updatedEntry} updated entries`)
  reporter.info(`Contentful: ${nodeCounts.deletedEntry} deleted entries`)
  reporter.info(
    `Contentful: ${
      memoryNodeCountsBySysType.Entry / locales.length
    } cached entries`
  )
  reporter.info(`Contentful: ${nodeCounts.newAsset} new assets`)
  reporter.info(`Contentful: ${nodeCounts.updatedAsset} updated assets`)
  reporter.info(
    `Contentful: ${
      memoryNodeCountsBySysType.Asset / locales.length
    } cached assets`
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

  const previousForeignReferenceMapState = await cache.get(
    CACHE_FOREIGN_REFERENCE_MAP_STATE
  )
  // Build foreign reference map before starting to insert any nodes
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

  await cache.set(CACHE_FOREIGN_REFERENCE_MAP_STATE, foreignReferenceMapState)
  const foreignReferenceMap = foreignReferenceMapState.backLinks

  reporter.verbose(`Resolving Contentful references`)

  let newOrUpdatedEntries = new Set()
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.add(`${entry.sys.id}___${entry.sys.type}`)
    })
  })

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

  if (isCachedBuild) {
    existingNodes.forEach(n => {
      if (
        !(
          n.sys.type === `Entry` &&
          !newOrUpdatedEntries.has(`${n.id}___${n.sys.type}`) &&
          !deletedEntryGatsbyReferenceIds.has(n.id)
        )
      ) {
        return
      }

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
  }

  // allow node to gc if it needs to
  // @ts-ignore
  newOrUpdatedEntries = undefined
  await untilNextEventLoopTick()

  // We need to call `createNode` on nodes we modified reverse links on,
  // otherwise changes won't actually persist
  if (existingNodesThatNeedReverseLinksUpdateInDatastore.size) {
    let existingNodesLoopCount = 0
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
        const nodeToUpdate = nodeToUpdateOriginal.__memcache
          ? getNode(nodeToUpdateOriginal.id)
          : nodeToUpdateOriginal

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

        const newNode = {
          ...nodeToUpdate,
          internal: {
            ...nodeToUpdate.internal,
            // We need to remove properties from existing fields
            // that are reserved and managed by Gatsby (`.internal.owner`, `.fields`).
            // Gatsby automatically will set `.owner` it back
            owner: undefined,
            // We add or modify counter postfix to contentDigest
            // to make sure Gatsby treat this as data update
            contentDigest: `${initialContentDigest}${CONTENT_DIGEST_COUNTER_SEPARATOR}${counter}`,
          },
          // `.fields` need to be created with `createNodeField` action, we can't just re-add them.
          // Other plugins (or site itself) will have opportunity to re-generate them in `onCreateNode` lifecycle.
          // Contentful content nodes are not using `createNodeField` so it's safe to delete them.
          // (Asset nodes DO use `createNodeField` for `localFile` and if we were updating those, then
          // we would also need to restore that field ourselves after re-creating a node)
          fields: undefined, // plugin adds node field on asset nodes which don't have reverse links
        }

        // memory cached nodes are mutated during back reference checks
        // so we need to carry over the changes to the updated node
        if (nodeToUpdateOriginal.__memcache) {
          for (const key of Object.keys(nodeToUpdateOriginal)) {
            if (!key.endsWith(`___NODE`)) {
              continue
            }

            newNode[key] = nodeToUpdateOriginal[key]
          }
        }

        createNode(newNode)

        if (existingNodesLoopCount++ % 2000 === 0) {
          // dont block the event loop
          await untilNextEventLoopTick()
        }
      }
    }
  }

  // allow node to gc if it needs to
  // @ts-ignore
  existingNodesThatNeedReverseLinksUpdateInDatastore = undefined
  await untilNextEventLoopTick()

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

    // allow node to garbage collect these items if it needs to
    contentTypeItems[i] = undefined
    entryList[i] = undefined
    await untilNextEventLoopTick()
  }

  if (assets.length) {
    reporter.info(`Creating ${assets.length} Contentful asset nodes`)
  }

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

    assets[i] = undefined
    if (i % 1000 === 0) {
      await untilNextEventLoopTick()
    }
  }

  await untilNextEventLoopTick()

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
