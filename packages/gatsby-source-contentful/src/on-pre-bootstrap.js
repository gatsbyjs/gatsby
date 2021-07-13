// @todo import syntax!
import normalize from "./normalize"
const isOnline = require(`is-online`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const { createClient } = require(`contentful`)
const v8 = require(`v8`)
const { CODES } = require(`./report`)
const fetchData = require(`./fetch`)
const { createPluginConfig } = require(`./plugin-options`)

const restrictedContentTypes = [`entity`, `reference`]

export async function onPreBootstrap(
  { reporter, cache, actions, parentSpan, getNode, getNodes, createNodeId },
  pluginOptions
) {
  // Fetch data for sourceNodes & createSchemaCustomization
  const { deleteNode, touchNode } = actions

  let currentSyncData
  let contentTypeItems
  let defaultLocale
  let locales
  let space
  if (process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE) {
    reporter.info(
      `GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE: Storing/loading remote data through \`` +
        process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE +
        `\` so Remote changes CAN NOT be detected!`
    )
  }
  const forceCache = await fs.exists(
    process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE
  )

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
  const syncToken = await cache.get(CACHE_SYNC_TOKEN)
  let previousSyncData = {
    assets: [],
    entries: [],
  }
  const cachedData = await cache.get(CACHE_SYNC_DATA)

  if (cachedData) {
    previousSyncData = cachedData
  }

  const fetchActivity = reporter.activityTimer(
    `Contentful: Fetch data (${sourceId})`,
    {
      parentSpan,
    }
  )

  // If the cache has data, use it. Otherwise do a remote fetch anyways and prime the cache now.
  // If present, do NOT contact contentful, skip the round trips entirely
  if (forceCache) {
    reporter.info(
      `GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE was set. Skipping remote fetch, using data stored in \`${process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE}\``
    )
    ;({
      currentSyncData,
      contentTypeItems,
      defaultLocale,
      locales,
      space,
    } = v8.deserialize(
      fs.readFileSync(process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE)
    ))
  } else {
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
        touchNode(node)
        if (node.localFile___NODE) {
          // Prevent GraphQL type inference from crashing on this property
          touchNode(getNode(node.localFile___NODE))
        }
      })

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
    ;({
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
    }))

    if (process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE) {
      reporter.info(
        `GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE was set. Writing v8 serialized glob of remote data to: ` +
          process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE
      )
      fs.writeFileSync(
        process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE,
        v8.serialize({
          currentSyncData,
          contentTypeItems,
          defaultLocale,
          locales,
          space,
        })
      )
    }
  }

  // Check for restricted content type names
  const useNameForId = pluginConfig.get(`useNameForId`)

  contentTypeItems.forEach(contentTypeItem => {
    // Establish identifier for content type
    //  Use `name` if specified, otherwise, use internal id (usually a natural-language constant,
    //  but sometimes a base62 uuid generated by Contentful, hence the option)
    let contentTypeItemId
    if (useNameForId) {
      contentTypeItemId = contentTypeItem.name.toLowerCase()
    } else {
      contentTypeItemId = contentTypeItem.sys.id.toLowerCase()
    }

    if (restrictedContentTypes.includes(contentTypeItemId)) {
      reporter.panic({
        id: CODES.FetchContentTypes,
        context: {
          sourceMessage: `Restricted ContentType name found. The name "${contentTypeItemId}" is not allowed.`,
        },
      })
    }
  })

  const allLocales = locales
  locales = locales.filter(pluginConfig.get(`localeFilter`))
  reporter.verbose(
    `Default locale: ${defaultLocale}.   All locales: ${allLocales
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

  fetchActivity.end()

  // Process data fetch results and turn them into GraphQL entities
  const processingActivity = reporter.activityTimer(
    `Contentful: Process data (${sourceId})`,
    {
      parentSpan,
    }
  )
  processingActivity.start()

  // Create a map of up to date entries and assets
  function mergeSyncData(previous, current, deleted) {
    const entryMap = new Map()
    previous.forEach(e => !deleted.has(e.sys.id) && entryMap.set(e.sys.id, e))
    current.forEach(e => !deleted.has(e.sys.id) && entryMap.set(e.sys.id, e))
    return [...entryMap.values()]
  }

  const deletedSet = new Set(currentSyncData.deletedEntries.map(e => e.sys.id))

  const mergedSyncData = {
    entries: mergeSyncData(
      previousSyncData.entries,
      currentSyncData.entries,
      deletedSet
    ),
    assets: mergeSyncData(
      previousSyncData.assets,
      currentSyncData.assets,
      deletedSet
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

  // Remove deleted entries & assets
  reporter.verbose(`Removing deleted Contentful entries & assets`)

  // @todo this should happen when sourcing?
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
      touchNode(node)
      deleteNode(node)
    })
  }

  currentSyncData.deletedEntries.forEach(deleteContentfulNode)
  currentSyncData.deletedAssets.forEach(deleteContentfulNode)

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  await Promise.all([
    cache.set(CACHE_SYNC_DATA, mergedSyncDataRaw),
    cache.set(CACHE_SYNC_TOKEN, nextSyncToken),
  ])

  await cache.set(`contentful-sync-result-${sourceId}`, {
    mergedSyncData,
    contentTypeItems,
    locales,
    space,
    defaultLocale,
  })

  processingActivity.end()
}
