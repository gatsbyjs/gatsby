const contentful = require(`contentful`)

const processAPIData = require(`./process-api-data`)

const conflictFieldPrefix = `contentful`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const fs = require(`fs`)
const stringifySafe = require(`json-stringify-safe`)
const _ = require(`lodash`)
const path = require(`path`)
const homedir = require(`os`).homedir

const HOME_DIR = path.resolve(homedir(), `.gatsby`)
const TMP_DIR = path.resolve(HOME_DIR, `contentful-source-plugin`)
const OLD_SYNC_DATA_PATH = path.resolve(TMP_DIR, `old_sync_data.json`)

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const { createNode } = boundActionCreators
  if(!fs.existsSync(HOME_DIR)) {
    fs.mkdirSync(HOME_DIR)
    fs.mkdirSync(TMP_DIR)
  }
  // Fetch articles.
  console.time(`fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })
  // Get sync token if it exists
  let syncToken
  let oldSyncData = { entries: [], assets: [], deletedEntries: [], deletedAssets: [] }
  if (fs.existsSync(OLD_SYNC_DATA_PATH)) {
    try {
      oldSyncData = JSON.parse(fs.readFileSync(OLD_SYNC_DATA_PATH, `utf8`))
      syncToken = oldSyncData.nextSyncToken
    } catch (e) {
      console.log(`Error parsing cached sync data: ${e}`) 
      syncToken = null // we sync from the beginning 
    }
  }
  // The SDK will map the entities to the following object
  // {
  //  entries,
  //  assets,
  //  deletedEntries,
  //  deletedAssets
  // }
  let syncData
  try {
    let query = syncToken ? { nextSyncToken: syncToken } : { initial: true }
    syncData = await client.sync(query) 
  } catch (e) {
    syncData = { entries: [], assets: [], deletedEntries: [], deletedAssets:[] }
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
  console.log(oldSyncData.etnries)
  oldSyncData.entries.filter(entry => {
    return _.find(
      syncData.entries, (newEntry) => newEntry.sys.id === entry.sys.id
      ||
        _.find(
          syncData.deletedEntries, (deletedEntry) => deletedEntry.sys.id === entry.sys.id
        )
    )
  })

  // merge entries
  oldSyncData.entries = oldSyncData.entries.concat(syncData.entries)
  const entryList = contentTypeItems.map(contentType => {
    return oldSyncData.entries.filter(entry => entry.sys.contentType.sys.id !== contentType.sys.id )
  })

  oldSyncData.assets.filter(asset => {
    return _.find(
        syncData.assets, (newAsset) => newAsset.sys.id === asset.sys.id
      )
      ||
        _.find(
          syncData.deletedAssets, (deletedAsset) => deletedAsset.sys.id === asset.sys.id
        )
  })

  oldSyncData.assets = oldSyncData.assets.concat(syncData.assets)
  let assets = oldSyncData.assets
  
  console.log(`Total assets `, assets.length)
  console.log(`Updated assets `, syncData.assets.length)
  console.log(`Deleted assets `, syncData.deletedAssets.length)
  console.timeEnd(`fetch Contentful data`)
  
  try {
    fs.writeFileSync(OLD_SYNC_DATA_PATH, stringifySafe(syncData))
  } catch(e) {
    console.log(`error while trying to cache the new synced data`, e)
  }
  // Create map of not resolvable ids so we can filter them out while creating
  // links.
  const notResolvable = new Map()

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    notResolvable,
  })

  contentTypeItems.forEach((contentTypeItem, i) => {
    console.log(contentTypeItem)
    console.log(entryList[i])
    processAPIData.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      notResolvable,
      foreignReferenceMap,
    })
  })

  assets.forEach(assetItem => {
    processAPIData.createAssetNodes({ assetItem, createNode })
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
