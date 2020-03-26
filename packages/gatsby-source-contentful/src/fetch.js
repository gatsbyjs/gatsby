const path = require(`path`)
const v8 = require(`v8`)
const fs = require(`fs`)

const contentful = require(`contentful`)
const _ = require(`lodash`)
const chalk = require(`chalk`)
const normalize = require(`./normalize`)
const { formatPluginOptionsForCLI } = require(`./plugin-options`)

// Path to read/write files fetched from remote so we can skip it
const REMOTE_CACHE_FOLDER = process.env.GATSBY_REMOTE_CACHE ?? ``
const CACHE_DATA_FILE = path.join(REMOTE_CACHE_FOLDER, `sync_data`)
const CACHE_TYPE_FILE = path.join(REMOTE_CACHE_FOLDER, `content_types`)

module.exports = async ({ syncToken, reporter, pluginConfig }) => {
  // Fetch articles.
  console.time(`Fetch Contentful data`)

  console.log(`Starting to fetch data from Contentful`)
  if (REMOTE_CACHE_FOLDER) {
    console.log(
      `Will use \`` +
        REMOTE_CACHE_FOLDER +
        `\` as the cache folder to read from if available, or write to after fetching`
    )
  }

  const pageLimit = pluginConfig.get(`pageLimit`)
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
    space = await client.getSpace()
    let contentfulLocales = await client
      .getLocales()
      .then(response => response.items)
    defaultLocale = _.find(contentfulLocales, { default: true }).code
    locales = contentfulLocales.filter(pluginConfig.get(`localeFilter`))
    if (locales.length === 0) {
      reporter.panic(
        `Please check if your localeFilter is configured properly. Locales '${_.join(
          contentfulLocales.map(item => item.code),
          `,`
        )}' were found but were filtered down to none.`
      )
    }
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

  // Three cases, both for the data and the types cache payloads:
  // - We may not be using the local cache at all: fetch it now
  // - The local cache may not exist: fetch it now, cache it
  // - The cache exists and we still want to fetch it:
  //    - Fetch it now, but
  //    - Start building immediately
  //    - When the data is received, match it against the cache
  //    - If the cache turns out to be stale, restart the build

  if (REMOTE_CACHE_FOLDER) {
    // Make sure the path exists
    fs.mkdirSync(REMOTE_CACHE_FOLDER, { recursive: true })
  }

  let currentSyncData
  try {
    if (REMOTE_CACHE_FOLDER && fs.existsSync(CACHE_DATA_FILE)) {
      try {
        currentSyncData = v8.deserialize(fs.readFileSync(CACHE_DATA_FILE))
        console.log(`Should have loaded data from \`` + CACHE_DATA_FILE + `\``)
      } catch (e) {
        console.warn(
          `Failed to read or deserialize local contentful data cache from \`` +
            CACHE_DATA_FILE +
            `\`, going to fetch it from remote. Error: ` +
            e
        )
      }
    }

    if (!currentSyncData) {
      let query = syncToken
        ? { nextSyncToken: syncToken }
        : { initial: true, limit: pageLimit }
      currentSyncData = await client.sync(query)

      if (CACHE_DATA_FILE) {
        try {
          console.log(
            `Updating the contentful data cache in \`` + CACHE_DATA_FILE + `\``
          )
          // Note: this object may contain cycles so JSON.stringify is unsafe
          fs.writeFileSync(CACHE_DATA_FILE, v8.serialize(currentSyncData))
        } catch (e) {
          console.warn(
            `Failed to serialize or write data to specified cache file: \`` +
              CACHE_DATA_FILE +
              `\`. Error: ` +
              e
          )
        }
      }
    }
  } catch (e) {
    reporter.panic(`Fetching contentful data failed:` + e)
  }

  // We need to fetch content types with the non-sync API as the sync API
  // doesn't support this.
  let contentTypes
  try {
    if (REMOTE_CACHE_FOLDER && fs.existsSync(CACHE_TYPE_FILE)) {
      try {
        contentTypes = v8.deserialize(fs.readFileSync(CACHE_TYPE_FILE))
        console.log(`Should have loaded types from \`` + CACHE_TYPE_FILE + `\``)
      } catch (e) {
        console.warn(
          `Failed to read or deserialize local contentful type cache from \`` +
            CACHE_TYPE_FILE +
            `\`, going to fetch it from remote. Error: ` +
            e
        )
      }
    }

    if (!contentTypes) {
      contentTypes = await pagedGet(client, `getContentTypes`, pageLimit)

      if (CACHE_TYPE_FILE) {
        try {
          console.log(
            `Updating the contentful type cache in \`` + CACHE_TYPE_FILE + `\``
          )
          // Note: this object may contain cycles so JSON.stringify is unsafe
          fs.writeFileSync(CACHE_TYPE_FILE, v8.serialize(contentTypes))
        } catch (e) {
          console.warn(
            `Failed to serialize or write types to specified cache file: \`` +
              CACHE_TYPE_FILE +
              `\`. Error: ` +
              e
          )
        }
      }
    }
  } catch (e) {
    reporter.panic(`Fetching contentful types failed`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  let contentTypeItems = contentTypes.items

  // Fix IDs (inline) on entries and assets, created/updated and deleted.
  contentTypeItems.forEach(normalize.fixIds)
  currentSyncData.entries.forEach(normalize.fixIds)
  currentSyncData.assets.forEach(normalize.fixIds)
  currentSyncData.deletedEntries.forEach(normalize.fixIds)
  currentSyncData.deletedAssets.forEach(normalize.fixIds)

  const result = {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales: locales && locales.slice && locales.slice(0, 1), // HACK: only use english
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
  pageLimit,
  query = {},
  skip = 0,
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
        pageLimit,
        query,
        skip + pageLimit,
        aggregatedResponse
      )
    }
    return aggregatedResponse
  })
}
