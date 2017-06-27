const contentful = require(`contentful`)

const processAPIData = require(`./process-api-data`)

const conflictFieldPrefix = `contentful`

// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const _ = require(`lodash`)

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async (
  { boundActionCreators, getNodes, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const {
    createNode,
    deleteNodes,
    touchNode,
    setPluginStatus,
  } = boundActionCreators

  // Fetch articles.
  console.time(`Fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })
  // The sync API puts the locale in all fields in this format { fieldName:
  // {'locale': value} } so we need to get the space and its default local.
  //
  // We'll extend this soon to support multiple locales.
  let space
  let defaultLocale = `en-US`
  try {
    console.log(`Fetching default locale`)
    space = await client.getSpace()
    defaultLocale = _.find(space.locales, { default: true }).code
    console.log(`default local is : ${defaultLocale}`)
  } catch (e) {
    console.log(
      `Accessing your Contentful space failed. Perhaps you're offline or the spaceId/accessToken is incorrect.`
    )
    // TODO perhaps continue if there's cached data? That would let
    // someone develop a contentful site even if not connected to the internet.
    // For prod builds though always fail if we can't get the latest data.
    process.exit(1)
  }

  // Get sync token if it exists.
  let syncToken
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins[`gatsby-source-contentful`]
  ) {
    syncToken = store.getState().status.plugins[`gatsby-source-contentful`]
      .status.syncToken
  }

  let currentSyncData
  try {
    let query = syncToken ? { nextSyncToken: syncToken } : { initial: true }
    currentSyncData = await client.sync(query)
  } catch (e) {
    console.log(`error fetching contentful data`, e)
    process.exit(1)
  }

  // We need to fetch content types with the non-sync API as the sync API
  // doesn't support this.
  let contentTypes
  try {
    contentTypes = await pagedGet(client, `getContentTypes`)
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  const contentTypeItems = contentTypes.items

  // Remove deleted entries & assets.
  // TODO figure out if entries referencing now deleted entries/assets
  // are "updated" so will get updated here.
  deleteNodes(currentSyncData.deletedEntries.map(e => e.sys.id))
  deleteNodes(currentSyncData.deletedAssets.map(e => e.sys.id))

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentful`
  )
  existingNodes.forEach(n => touchNode(n.id))

  let entryList = contentTypeItems.map(contentType =>
    currentSyncData.entries.filter(
      entry => entry.sys.contentType.sys.id === contentType.sys.id
    )
  )

  const assets = currentSyncData.assets

  console.log(`Updated entries `, currentSyncData.entries.length)
  console.log(`Deleted entries `, currentSyncData.deletedEntries.length)
  console.log(`Updated assets `, currentSyncData.assets.length)
  console.log(`Deleted assets `, currentSyncData.deletedAssets.length)
  console.timeEnd(`Fetch Contentful data`)

  // Update syncToken
  const nextSyncToken = currentSyncData.nextSyncToken

  // Store our sync state for the next sync.
  setPluginStatus({
    status: {
      syncToken: nextSyncToken,
    },
  })

  // Create map of resolvable ids so we can check links against them while creating
  // links.
  const resolvable = new Set()
  existingNodes.forEach(n => resolvable.add(n.id))

  const newOrUpdatedEntries = []
  entryList.forEach(entries => {
    entries.forEach(entry => {
      newOrUpdatedEntries.push(entry.sys.id)
      resolvable.add(entry.sys.id)
    })
  })
  assets.forEach(assetItem => resolvable.add(assetItem.sys.id))

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = processAPIData.buildForeignReferenceMap({
    contentTypeItems,
    entryList,
    resolvable,
    defaultLocale,
  })

  // Update existing entry nodes that weren't updated but that need reverse
  // links added.
  Object.keys(foreignReferenceMap)
  existingNodes
    .filter(n => _.includes(newOrUpdatedEntries, n.id))
    .forEach(n => {
      if (foreignReferenceMap[n.id]) {
        foreignReferenceMap[n.id].forEach(foreignReference => {
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
        })
      }
    })

  contentTypeItems.forEach((contentTypeItem, i) => {
    processAPIData.createContentTypeNodes({
      contentTypeItem,
      restrictedNodeFields,
      conflictFieldPrefix,
      entries: entryList[i],
      createNode,
      resolvable,
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
function pagedGet(
  client,
  method,
  query = {},
  skip = 0,
  pageLimit = 1000,
  aggregatedResponse = null
) {
  return client
    [method]({
      ...query,
      skip: skip,
      limit: pageLimit,
      order: `sys.createdAt`,
    })
    .then(response => {
      if (!aggregatedResponse) {
        aggregatedResponse = response
      } else {
        aggregatedResponse.items = aggregatedResponse.items.concat(
          response.items
        )
      }
      if (skip + pageLimit <= response.total) {
        return pagedGet(client, method, skip + pageLimit, aggregatedResponse)
      }
      return aggregatedResponse
    })
}
