const contentful = require(`contentful`)
const _ = require(`lodash`)

module.exports = async ({ spaceId, accessToken, syncToken }) => {
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

  return { currentSyncData, contentTypeItems, defaultLocale }
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
