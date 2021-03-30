const path = require(`path`)
const isOnline = require(`is-online`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const { createClient } = require(`contentful`)
const v8 = require(`v8`)
const fetch = require(`@vercel/fetch-retry`)(require(`node-fetch`))
const { CODES } = require(`./report`)

const normalize = require(`./normalize`)
const fetchData = require(`./fetch`)
const { createPluginConfig, maskText } = require(`./plugin-options`)
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

const validateContentfulAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined

  await fetch(
    `https://${pluginOptions.host}/spaces/${pluginOptions.spaceId}/environments/${pluginOptions.environment}/content_types`,
    {
      headers: {
        Authorization: `Bearer ${pluginOptions.accessToken}`,
        "Content-Type": `application/json`,
      },
    }
  )
    .then(res => res.ok)
    .then(ok => {
      if (!ok) {
        const errorMessage = `Cannot access Contentful space "${maskText(
          pluginOptions.spaceId
        )}" on environment "${
          pluginOptions.environment
        } with access token "${maskText(
          pluginOptions.accessToken
        )}". Make sure to double check them!`

        throw new Error(errorMessage)
      }
    })

  return undefined
}

const pluginOptionsSchema = ({ Joi }) =>
  Joi.object()
    .keys({
      accessToken: Joi.string()
        .description(
          `Contentful delivery api key, when using the Preview API use your Preview API key`
        )
        .required()
        .empty(),
      spaceId: Joi.string()
        .description(`Contentful spaceId`)
        .required()
        .empty(),
      host: Joi.string()
        .description(
          `The base host for all the API requests, by default it's 'cdn.contentful.com', if you want to use the Preview API set it to 'preview.contentful.com'. You can use your own host for debugging/testing purposes as long as you respect the same Contentful JSON structure.`
        )
        .default(`cdn.contentful.com`)
        .empty(),
      environment: Joi.string()
        .description(
          `The environment to pull the content from, for more info on environments check out this [Guide](https://www.contentful.com/developers/docs/concepts/multiple-environments/).`
        )
        .default(`master`)
        .empty(),
      downloadLocal: Joi.boolean()
        .description(
          `Downloads and caches ContentfulAsset's to the local filesystem. Allows you to query a ContentfulAsset's localFile field, which is not linked to Contentful's CDN. Useful for reducing data usage.
You can pass in any other options available in the [contentful.js SDK](https://github.com/contentful/contentful.js#configuration).`
        )
        .default(false),
      localeFilter: Joi.func()
        .description(
          `Possibility to limit how many locales/nodes are created in GraphQL. This can limit the memory usage by reducing the amount of nodes created. Useful if you have a large space in contentful and only want to get the data from one selected locale.
For example, to filter locales on only germany \`localeFilter: locale => locale.code === 'de-DE'\`

List of locales and their codes can be found in Contentful app -> Settings -> Locales`
        )
        .default(() => () => true),
      forceFullSync: Joi.boolean()
        .description(
          `Prevents the use of sync tokens when accessing the Contentful API.`
        )
        .default(false),
      pageLimit: Joi.number()
        .integer()
        .description(
          `Number of entries to retrieve from Contentful at a time. Due to some technical limitations, the response payload should not be greater than 7MB when pulling content from Contentful. If you encounter this issue you can set this param to a lower number than 100, e.g 50.`
        )
        .default(1000),
      assetDownloadWorkers: Joi.number()
        .integer()
        .description(
          `Number of workers to use when downloading contentful assets. Due to technical limitations, opening too many concurrent requests can cause stalled downloads. If you encounter this issue you can set this param to a lower number than 50, e.g 25.`
        )
        .default(50),
      proxy: Joi.object()
        .keys({
          host: Joi.string().required(),
          port: Joi.number().required(),
          auth: Joi.object().keys({
            username: Joi.string(),
            password: Joi.string(),
          }),
        })
        .description(
          `Axios proxy configuration. See the [axios request config documentation](https://github.com/mzabriskie/axios#request-config) for further information about the supported values.`
        ),
      useNameForId: Joi.boolean()
        .description(
          `Use the content's \`name\` when generating the GraphQL schema e.g. a Content Type called \`[Component] Navigation bar\` will be named \`contentfulComponentNavigationBar\`.
    When set to \`false\`, the content's internal ID will be used instead e.g. a Content Type with the ID \`navigationBar\` will be called \`contentfulNavigationBar\`.

    Using the ID is a much more stable property to work with as it will change less often. However, in some scenarios, Content Types' IDs will be auto-generated (e.g. when creating a new Content Type without specifying an ID) which means the name in the GraphQL schema will be something like \`contentfulC6XwpTaSiiI2Ak2Ww0oi6qa\`. This won't change and will still function perfectly as a valid field name but it is obviously pretty ugly to work with.

    If you are confident your Content Types will have natural-language IDs (e.g. \`blogPost\`), then you should set this option to \`false\`. If you are unable to ensure this, then you should leave this option set to \`true\` (the default).`
        )
        .default(true),
      // default plugins passed by gatsby
      plugins: Joi.array(),
    })
    .external(validateContentfulAccess)

exports.pluginOptionsSchema = pluginOptionsSchema

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
  const { createNode, deleteNode, touchNode, createTypes } = actions

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

  if (forceCache) {
    // If the cache has data, use it. Otherwise do a remote fetch anyways and prime the cache now.
    // If present, do NOT contact contentful, skip the round trips entirely
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

  createTypes(`
  interface ContentfulEntry implements Node {
    contentful_id: String!
    id: ID!
    node_locale: String!
  }
`)

  createTypes(`
  interface ContentfulReference {
    contentful_id: String!
    id: ID!
  }
`)

  createTypes(
    schema.buildObjectType({
      name: `ContentfulAsset`,
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
      },
      interfaces: [`ContentfulReference`, `Node`],
    })
  )

  const gqlTypes = contentTypeItems.map(contentTypeItem =>
    schema.buildObjectType({
      name: _.upperFirst(
        _.camelCase(
          `Contentful ${
            pluginConfig.get(`useNameForId`)
              ? contentTypeItem.name
              : contentTypeItem.sys.id
          }`
        )
      ),
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
        node_locale: { type: `String!` },
      },
      interfaces: [`ContentfulReference`, `ContentfulEntry`, `Node`],
    })
  )

  createTypes(gqlTypes)

  fetchActivity.end()

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
      touchNode(node)
      deleteNode(node)
    })
  }

  currentSyncData.deletedEntries.forEach(deleteContentfulNode)
  currentSyncData.deletedAssets.forEach(deleteContentfulNode)

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )
  existingNodes.forEach(n => touchNode(n))

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
        getNode,
        resolvable,
        foreignReferenceMap,
        defaultLocale,
        locales,
        space,
        useNameForId: pluginConfig.get(`useNameForId`),
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
      getNode,
      getNodesByType,
      reporter,
      assetDownloadWorkers: pluginConfig.get(`assetDownloadWorkers`),
    })
  }

  return
}

// Check if there are any ContentfulAsset nodes and if gatsby-image is installed. If so,
// add fragments for ContentfulAsset and gatsby-image. The fragment will cause an error
// if there's not ContentfulAsset nodes and without gatsby-image, the fragment is useless.
exports.onPreExtractQueries = async ({ store }) => {
  const program = store.getState().program

  const CACHE_DIR = path.resolve(
    `${program.directory}/.cache/contentful/assets/`
  )
  await fs.ensureDir(CACHE_DIR)
}
