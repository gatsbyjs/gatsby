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

  let contentTypes
  try {
    contentTypes = await pagedGet(client, `getContentTypes`)
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  const entryList = await Promise.all(
    contentTypes.items.map(async contentType => {
      const contentTypeId = contentType.sys.id
      let entries
      try {
        entries = await pagedGet(client, { content_type: contentTypeId }, `getEntries`)
      } catch (e) {
        console.log(`error fetching entries`, e)
      }
      console.log(
        `entries fetched for content type ${contentType.name} (${contentTypeId})`,
        entries.items.length
      )
      return entries
    })
  )

  let assets
  try {
    assets = await  pagedGet(client, `getAssets`)
  } catch (e) {
    console.log(`error fetching assets`, e)
  }

  console.log(`assets fetched`, assets.items.length)
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
