const contentful = require(`contentful`)
const _ = require(`lodash`)
const chalk = require(`chalk`)
const normalize = require(`./normalize`)
const { formatPluginOptionsForCLI } = require(`./plugin-options`)

module.exports = async ({ syncToken, reporter, pluginConfig }) => {
  // Fetch articles.
  console.time(`Fetch Contentful data`)

  console.log(`Starting to fetch data from Contentful`)

  const contentfulClientOptions = {
    space: pluginConfig.get(`spaceId`),
    accessToken: pluginConfig.get(`accessToken`),
    host: pluginConfig.get(`host`),
    environment: pluginConfig.get(`environment`),
    proxy: pluginConfig.get(`proxy`),
  }

  const client = contentful.createClient(contentfulClientOptions)

  // The sync API puts the locale in all fields in this format { fieldName:
  // {'locale': value} } so we need to get the space and its default local.
  //
  // We'll extend this soon to support multiple locales.
  let space
  let locales
  let defaultLocale = `en-US`
  try {
    console.log(`Fetching default locale`)
    space = await client.getSpace()
    locales = await client.getLocales().then(response => response.items)
    defaultLocale = _.find(locales, { default: true }).code
    locales = locales.filter(pluginConfig.get(`localeFilter`))
    console.log(`default locale is : ${defaultLocale}`)
  } catch (e) {
    let details
    let errors
    if (e.code === `ENOTFOUND`) {
      details = `You seem to be offline`
    } else if (e.code === `SELF_SIGNED_CERT_IN_CHAIN`) {
      reporter.panic(
        `We couldn't make a secure connection to your contentful space. Please check if you have any self-signed SSL certificates installed.`,
        e
      )
    } else if (e.response) {
      if (e.response.status === 404) {
        // host and space used to generate url
        details = `Endpoint not found. Check if ${chalk.yellow(
          `host`
        )} and ${chalk.yellow(`spaceId`)} settings are correct`
        errors = {
          host: `Check if setting is correct`,
          spaceId: `Check if setting is correct`,
        }
      } else if (e.response.status === 401) {
        // authorization error
        details = `Authorization error. Check if ${chalk.yellow(
          `accessToken`
        )} and ${chalk.yellow(`environment`)} are correct`
        errors = {
          accessToken: `Check if setting is correct`,
          environment: `Check if setting is correct`,
        }
      }
    }

    reporter.panic(`Accessing your Contentful space failed.
Try setting GATSBY_CONTENTFUL_OFFLINE=true to see if we can serve from cache.
${details ? `\n${details}\n` : ``}
Used options:
${formatPluginOptionsForCLI(pluginConfig.getOriginalPluginOptions(), errors)}`)
  }

  let currentSyncData
  try {
    let query = syncToken ? { nextSyncToken: syncToken } : { initial: true }
    currentSyncData = await client.sync(query)
  } catch (e) {
    reporter.panic(`Fetching contentful data failed`, e)
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

  let contentTypeItems = contentTypes.items

  // Fix IDs on entries and assets, created/updated and deleted.
  contentTypeItems = contentTypeItems.map(c => normalize.fixIds(c))

  currentSyncData.entries = currentSyncData.entries.map(e => {
    if (e) {
      return normalize.fixIds(e)
    }
    return null
  })
  currentSyncData.assets = currentSyncData.assets.map(a => {
    if (a) {
      return normalize.fixIds(a)
    }
    return null
  })
  currentSyncData.deletedEntries = currentSyncData.deletedEntries.map(e => {
    if (e) {
      return normalize.fixIds(e)
    }
    return null
  })
  currentSyncData.deletedAssets = currentSyncData.deletedAssets.map(a => {
    if (a) {
      return normalize.fixIds(a)
    }
    return null
  })

  const result = {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales,
    space,
  }

  return result
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
  return client[method]({
    ...query,
    skip: skip,
    limit: pageLimit,
    order: `sys.createdAt`,
  }).then(response => {
    if (!aggregatedResponse) {
      aggregatedResponse = response
    } else {
      aggregatedResponse.items = aggregatedResponse.items.concat(response.items)
    }
    if (skip + pageLimit <= response.total) {
      return pagedGet(
        client,
        method,
        query,
        skip + pageLimit,
        pageLimit,
        aggregatedResponse
      )
    }
    return aggregatedResponse
  })
}
