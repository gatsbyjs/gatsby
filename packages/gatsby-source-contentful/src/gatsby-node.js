const contentful = require(`contentful`)

const processAPIData = require(`./process-api-data`)

const conflictFieldPrefix = `contentful`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const { createNode } = boundActionCreators

  // Fetch articles.
  console.time(`fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })

  // The SDK will map the entities to the following object
  // {
  //  entries,
  //  assets,
  //  deletedEntries,
  //  deletedAssets
  // }
  let syncData
  try {
    // TODO get syncToken if it exists
    // TODO store the data somewhere ?
    syncData = await client.sync() 
  } catch (e) {
    // TODO maybe fail here
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

  // TODO pull the old sync data, remove deletedEntries and concat entries
  const entryList = syncData.entries
  console.log(`Total entries `, entryList.length)
  console.log(`Updated entries `, syncData.entries.length)
  console.log(`Deleted entries `, syncData.deletedEntries.length)

  // TODO same as entriess
  let assets = syncData.assets

  console.log(`Total assets `, assets.length)
  console.log(`Updated assets `, syncData.assets.length)
  console.log(`Deleted assets `, syncData.deletedAssets.length)
  console.timeEnd(`fetch Contentful data`)

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

  const contentTypeItems = contentTypes.items

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    notResolvable,
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
    })
  })

  assets.items.forEach(assetItem => {
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
