const path = require(`path`)
const isOnline = require(`is-online`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const { createClient } = require(`contentful`)

const normalize = require(`./normalize`)
const fetchData = require(`./fetch`)
const { createPluginConfig, validateOptions } = require(`./plugin-options`)
const { downloadContentfulAssets } = require(`./download-contentful-assets`)

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

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.onPreBootstrap = validateOptions
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

exports.sourceNodes = async (
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
    schema,
    parentSpan,
  },
  pluginOptions
) => {
  const { createNode, deleteNode, touchNode } = actions
  const online = await isOnline()

  // If the user knows they are offline, serve them cached result
  // For prod builds though always fail if we can't get the latest data
  if (
    !online &&
    process.env.GATSBY_CONTENTFUL_OFFLINE === `true` &&
    process.env.NODE_ENV !== `production`
  ) {
    getNodes().forEach(node => {
      if (node.internal.owner !== `gatsby-source-contentful`) {
        return
      }
      touchNode({ nodeId: node.id })
      if (node.localFile___NODE) {
        // Prevent GraphQL type inference from crashing on this property
        touchNode({ nodeId: node.localFile___NODE })
      }
    })

    reporter.info(`Using Contentful Offline cache ⚠️`)
    reporter.info(
      `Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files`
    )

    return
  }

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`
  const CACHE_SYNC_TOKEN = `contentful-sync-token-${sourceId}`
  const CACHE_SYNC_DATA = `contentful-sync-data-${sourceId}`

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
  let syncToken = await cache.get(CACHE_SYNC_TOKEN)
  let previousSyncData = {
    assets: [],
    entries: [],
  }
  let cachedData = await cache.get(CACHE_SYNC_DATA)

  if (cachedData) {
    previousSyncData = cachedData
  }

  const fetchActivity = reporter.activityTimer(
    `Contentful: Fetch data (${sourceId})`,
    {
      parentSpan,
    }
  )
  fetchActivity.start()

  let {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales,
    space,
  } = await fetchData({
    syncToken,
    reporter,
    pluginConfig,
    parentSpan,
  })
  fetchActivity.end()

  const processingActivity = reporter.activityTimer(
    `Contentful: Proccess data (${sourceId})`,
    {
      parentSpan,
    }
  )
  processingActivity.start()

  // Create a map of up to date entries and assets
  function mergeSyncData(previous, current, deleted) {
    const entryMap = new Map()
    previous.forEach(
      e => !deleted.includes(e.sys.id) && entryMap.set(e.sys.id, e)
    )
    current.forEach(
      e => !deleted.includes(e.sys.id) && entryMap.set(e.sys.id, e)
    )
    return [...entryMap.values()]
  }

  const mergedSyncData = {
    entries: mergeSyncData(
      previousSyncData.entries,
      currentSyncData.entries,
      currentSyncData.deletedEntries.map(e => e.sys.id)
    ),
    assets: mergeSyncData(
      previousSyncData.assets,
      currentSyncData.assets,
      currentSyncData.deletedAssets.map(e => e.sys.id)
    ),
  }

  // Store a raw and unresolved copy of the data for caching
  const mergedSyncDataRaw = _.cloneDeep(mergedSyncData)

  // Use the JS-SDK to resolve the entries and assets
  const res = createClient({
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

  const entryList = normalize.buildEntryList({
    mergedSyncData,
    contentTypeItems,
  })

  // Remove deleted entries & assets.
  // TODO figure out if entries referencing now deleted entries/assets
  // are "updated" so will get the now deleted reference removed.

  function deleteContentfulNode(node) {
    const normalizedType = node.sys.type.startsWith(`Deleted`)
      ? node.sys.type.substring(`Deleted`.length)
      : node.sys.type

    const localizedNodes = locales
      .map(locale => {
        const nodeId = createNodeId(
          normalize.makeId({
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
      touchNode({ nodeId: node.id })
      deleteNode({ node })
    })
  }

  currentSyncData.deletedEntries.forEach(deleteContentfulNode)
  currentSyncData.deletedAssets.forEach(deleteContentfulNode)

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )
  existingNodes.forEach(n => touchNode({ nodeId: n.id }))

  const assets = mergedSyncData.assets

  reporter.info(`Updated entries ${currentSyncData.entries.length}`)
  reporter.info(`Deleted entries ${currentSyncData.deletedEntries.length}`)
  reporter.info(`Updated assets ${currentSyncData.assets.length}`)
  reporter.info(`Deleted assets ${currentSyncData.deletedAssets.length}`)

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  await Promise.all([
    cache.set(CACHE_SYNC_DATA, mergedSyncDataRaw),
    cache.set(CACHE_SYNC_TOKEN, nextSyncToken),
  ])

  reporter.verbose(`Building Contentful reference map`)

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = normalize.buildResolvableSet({
    existingNodes,
    entryList,
    assets,
    defaultLocale,
    locales,
    space,
  })

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = normalize.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
    locales,
    space,
    useNameForId: pluginConfig.get(`useNameForId`),
  })

  reporter.verbose(`Resolving Contentful references`)

  const newOrUpdatedEntries = []
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.push(`${entry.sys.id}___${entry.sys.type}`)
    })
  })

  // Update existing entry nodes that weren't updated but that need reverse
  // links added.
  existingNodes
    .filter(n => _.includes(newOrUpdatedEntries, `${n.id}___${n.sys.type}`))
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

  processingActivity.end()

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
      normalize.createNodesForContentType({
        contentTypeItem,
        contentTypeItems,
        restrictedNodeFields,
        conflictFieldPrefix,
        entries: entryList[i],
        createNode,
        createNodeId,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: pluginConfig.get(`useNameForId`),
        richTextOptions: pluginConfig.get(`richText`),
      })
    )
  }

  if (assets.length) {
    reporter.info(`Creating ${assets.length} Contentful asset nodes`)
  }

  for (let i = 0; i < assets.length; i++) {
    // We wait for each asset to be process until handling the next one.
    await Promise.all(
      normalize.createAssetNodes({
        assetItem: assets[i],
        createNode,
        createNodeId,
        defaultLocale,
        locales,
        space,
      })
    )
  }

  creationActivity.end()

  if (pluginConfig.get(`downloadLocal`)) {
    reporter.info(`Download Contentful asset files`)

    await downloadContentfulAssets({
      actions,
      createNodeId,
      store,
      cache,
      getCache,
      getNodesByType,
      reporter,
    })
  }

  return
}

// Check if there are any ContentfulAsset nodes and if gatsby-image is installed. If so,
// add fragments for ContentfulAsset and gatsby-image. The fragment will cause an error
// if there's not ContentfulAsset nodes and without gatsby-image, the fragment is useless.
exports.onPreExtractQueries = async ({ store, getNodesByType }) => {
  const program = store.getState().program

  const CACHE_DIR = path.resolve(
    `${program.directory}/.cache/contentful/assets/`
  )
  await fs.ensureDir(CACHE_DIR)
}
