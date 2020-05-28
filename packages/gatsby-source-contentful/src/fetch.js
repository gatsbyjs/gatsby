const contentful = require(`contentful`)
const { createContentDigest } = require(`gatsby-core-utils`)
const chalk = require(`chalk`)
const { formatPluginOptionsForCLI } = require(`./plugin-options`)
const normalize = require(`./normalize`)

let clients = new Map()
const createOrGetClient = pluginConfig => {
  const contentfulClientOptions = {
    space: pluginConfig.get(`spaceId`),
    accessToken: pluginConfig.get(`accessToken`),
    host: pluginConfig.get(`host`),
    environment: pluginConfig.get(`environment`),
    proxy: pluginConfig.get(`proxy`),
  }

  const hash = createContentDigest(contentfulClientOptions)
  if (clients.has(hash)) {
    return clients.get(hash)
  }

  clients.set(hash, contentful.createClient(contentfulClientOptions))
  return clients.get(hash)
}

async function checkAccessToContentfulSpace(reporter, pluginConfig) {
  try {
    await getSpace(pluginConfig)
  } catch (e) {
    let details
    let errors

    if (e.code === `SELF_SIGNED_CERT_IN_CHAIN`) {
      reporter.panic(
        `We couldn't make a secure connection to your contentful space. Please check if you have any self-signed SSL certificates installed.`,
        e
      )
    }

    if (e.code === `ENOTFOUND`) {
      details = `You seem to be offline`
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
  ${formatPluginOptionsForCLI(
    pluginConfig.getOriginalPluginOptions(),
    errors
  )}`)
  }
}

async function getContentTypes(pluginConfig) {
  const client = createOrGetClient(pluginConfig)
  const pageLimit = pluginConfig.get(`pageLimit`)

  const { items } = await pagedGet(client, `getContentTypes`, pageLimit)
  items.forEach(normalize.fixIds)

  return items
}

async function getLocales(pluginConfig) {
  const client = createOrGetClient(pluginConfig)

  let { items: locales } = await client.getLocales()
  const defaultLocale = locales.find(locale => locale.default).code
  const activeLocales = locales.filter(pluginConfig.get(`localeFilter`))

  if (activeLocales.length === 0) {
    throw new Error(
      `Please check if your localeFilter is configured properly. Locales '${locales
        .map(item => item.code)
        .join(`, `)} were found but were filtered down to none.`
    )
  }

  return {
    defaultLocale,
    locales: activeLocales,
  }
}

async function* getSyncData(syncToken, pluginConfig) {
  const client = createOrGetClient(pluginConfig)
  let currentSyncData
  do {
    const query = {
      initial: !syncToken,
      nextSyncToken:
        syncToken && !currentSyncData?.nextPageToken ? syncToken : null,
      nextPageToken: currentSyncData?.nextPageToken ?? null,
      limit: pluginConfig.get(`pageLimit`),
    }
    currentSyncData = await client.sync(query, { paginate: false })

    // Fix IDs (inline) on entries and assets, created/updated and deleted.
    currentSyncData.entries.forEach(normalize.fixIds)
    currentSyncData.assets.forEach(normalize.fixIds)
    currentSyncData.deletedEntries.forEach(normalize.fixIds)
    currentSyncData.deletedAssets.forEach(normalize.fixIds)

    yield currentSyncData
  } while (currentSyncData.nextPageToken)
}

function getSpace(pluginConfig) {
  const client = createOrGetClient(pluginConfig)

  return client.getSpace()
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

exports.checkAccessToContentfulSpace = checkAccessToContentfulSpace
exports.getContentTypes = getContentTypes
exports.getLocales = getLocales
exports.getSyncData = getSyncData
exports.getSpace = getSpace
