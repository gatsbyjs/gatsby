const contentful = require(`contentful`)

const processAPIData = require(`./process-api-data`)

const conflictFieldPrefix = `contentful`

// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const _ = require(`lodash`)

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const { createNode, setPluginStatus } = boundActionCreators
  
  // Fetch articles.
  console.time(`Fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })
  // the structure of the sync payload is a bit different
  // all field will be in this format { fieldName: {'locale': value} } so we need to get the space and its default local
  // this can be extended later to support multiple locals
  let space
  let defaultLocale = `en-US`
  try {
    console.log(`Fetching default locale`)
    space = await client.getSpace()
    defaultLocale = _.find(space.locales, { 'default': true }).code
    console.log(`default local is : ${defaultLocale}`)
  } catch (e) {
    console.log(`can't get space`)
    // TODO maybe return here
  }

  // Get sync token if it exists
  let syncToken
  let lastSyncedData = { entries: [], assets: [], deletedEntries: [], deletedAssets: [], nextSyncToken: null }
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins[`gatsby-source-contentful`]
  ) {
    lastSyncedData = store.getState().status.plugins[`gatsby-source-contentful`].status
      .lastSyncedData
    syncToken = lastSyncedData.nextSyncToken
  }

  // The SDK will map the entities to the following object
  // {
  //  entries,
  //  assets,
  //  deletedEntries,
  //  deletedAssets
  // }
  let currentSyncData
  try {
    let query = syncToken ? { nextSyncToken: syncToken } : { initial: true }
    currentSyncData = await client.sync(query) 
  } catch (e) {
    currentSyncData = { entries: [], assets: [], deletedEntries: [], deletedAssets:[] }
    console.log(`error fetching contentful data`, e)
  }

  // We fetch content types normaly since we don't receive it in the sync data
  let contentTypes
  try {
    contentTypes = await pagedGet(client, `getContentTypes`)
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  const contentTypeItems = contentTypes.items
  // remove outdated entries 
  lastSyncedData.entries.filter(entry => {
    return _.find(
      currentSyncData.entries, (newEntry) => newEntry.sys.id === entry.sys.id
      ||
        _.find(
          currentSyncData.deletedEntries, (deletedEntry) => deletedEntry.sys.id === entry.sys.id
        )
    )
  })

  // merge entries
  lastSyncedData.entries = lastSyncedData.entries.concat(currentSyncData.entries)
  let entryList = contentTypeItems.map(contentType => {
    return lastSyncedData.entries.filter(entry => entry.sys.contentType.sys.id === contentType.sys.id )
  })

  lastSyncedData.assets.filter(asset => {
    return _.find(
        currentSyncData.assets, (newAsset) => newAsset.sys.id === asset.sys.id
      )
      ||
        _.find(
          currentSyncData.deletedAssets, (deletedAsset) => deletedAsset.sys.id === asset.sys.id
        )
  })

  lastSyncedData.assets = lastSyncedData.assets.concat(currentSyncData.assets)
  let assets = lastSyncedData.assets
  
  console.log(`Total assets `, assets.length)
  console.log(`Updated assets `, currentSyncData.assets.length)
  console.log(`Deleted assets `, currentSyncData.deletedAssets.length)
  console.timeEnd(`fetch Contentful data`)
 
  // update syncToken
  lastSyncedData.nextSyncToken = currentSyncData.nextSyncToken
  // cache the data
  setPluginStatus({
    status: {
      lastSyncedData: lastSyncedData,
    },
  })

  // Create map of not resolvable ids so we can filter them out while creating
  // links.
  const notResolvable = new Map()
  entryList.forEach(ents => {
    if (ents.errors) {
      ents.errors.forEach(error => {
        if (error.sys.id === `notResolvable`) {
          notResolvable.set(error.details.id, error.details)
        }
      })
    }
  })

 // entryList = entryList.map(entries => entries.map(entryItem => {
   // entryItem.defaultLocale = defaultLocale
   // return new Proxy(entryItem, localeProxyHandler)
 // }))
// Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    notResolvable,
    defaultLocale,
  })
  contentTypeItems.forEach((contentTypeItem, i) => {
    processAPIData.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      notResolvable,
      foreignReferenceMap,
      defaultLocale,
    })
  })

  assets.forEach(assetItem => {
    processAPIData.createAssetNodes({ assetItem, createNode, defaultLocale })
  })

  return
}
/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 */
function pagedGet (client, method, query = {}, skip = 0, pageLimit = 1000, aggregatedResponse = null) {
  return client[method]({
    ...query,
    skip: skip,
    limit: pageLimit,
    order: `sys.createdAt`,
  })
  .then((response) => {
    if (!aggregatedResponse) {
      aggregatedResponse = response
    } else {
      aggregatedResponse.items = aggregatedResponse.items.concat(response.items)
    }
    if (skip + pageLimit <= response.total) {
      return pagedGet(client, method, skip + pageLimit, aggregatedResponse)
    }
    return aggregatedResponse
  })
}
