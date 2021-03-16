const contentful = require(`contentful`)
const _ = require(`lodash`)
const chalk = require(`chalk`)
const { formatPluginOptionsForCLI } = require(`./plugin-options`)
const { CODES } = require(`./report`)

const createContentfulErrorMessage = e => {
  if (typeof e === `string`) {
    return e
  }

  // If we get a response, use this as basis to create the error message
  // Contentful JS SDK tends to give errors with different structures:
  // https://github.com/contentful/contentful.js/blob/b67b77ac8c919c4ec39203f8cac2043854ab0014/lib/create-contentful-api.js#L89-L99
  if (e.response) {
    e = { ...e, ...e.response }

    if (typeof e.response.data === `string`) {
      try {
        const data = JSON.parse(e.response.data)
        if (data && typeof data === `object`) {
          e = { ...e, ...data }
        }
      } catch (err) {
        e.message = `Unable to extract API error data from:\n${e.response.data}`
      }
    } else if (typeof e.response.data === `object`) {
      e = { ...e, ...e.response.data }
    }
  }

  let errorMessage = [
    // Generic error responses
    e.code && `${e.code}`,
    e.status && `${e.status}`,
    e.statusText,
    // Contentful API error Responses
    e?.sys?.id,
  ]
    .filter(Boolean)
    .join(` `)

  if (e.message) {
    errorMessage += `\n\n${e.message}`
  }

  const requestId =
    (e.headers &&
      typeof e.headers === `object` &&
      e.headers[`x-contentful-request-id`]) ||
    e.requestId

  if (requestId) {
    errorMessage += `\n\nRequest ID: ${requestId}`
  }

  if (e.attempts) {
    errorMessage += `\n\nThe request was sent with ${e.attempts} attempts`
  }

  return errorMessage
}

module.exports = async function contentfulFetch({
  syncToken,
  pluginConfig,
  reporter,
}) {
  // Fetch articles.
  let syncProgress
  const pageLimit = pluginConfig.get(`pageLimit`)
  const contentfulClientOptions = {
    space: pluginConfig.get(`spaceId`),
    accessToken: pluginConfig.get(`accessToken`),
    host: pluginConfig.get(`host`),
    environment: pluginConfig.get(`environment`),
    proxy: pluginConfig.get(`proxy`),
    integration: `gatsby-source-contentful`,
    responseLogger: response => {
      function createMetadataLog(response) {
        if (!response.headers) {
          return null
        }
        return [
          response?.headers[`content-length`] &&
            `size: ${response.headers[`content-length`]}B`,
          response?.headers[`x-contentful-request-id`] &&
            `request id: ${response.headers[`x-contentful-request-id`]}`,
          response?.headers[`x-cache`] &&
            `cache: ${response.headers[`x-cache`]}`,
        ]
          .filter(Boolean)
          .join(` `)
      }

      // Sync progress
      if (
        response.config.url === `sync` &&
        !response.isAxiosError &&
        response?.data.items
      ) {
        syncProgress.tick(response.data.items.length)
      }

      const metadataLog = createMetadataLog(response)

      reporter.verbose(
        [
          `${response.config.method} /${response.config.url}:`,
          response.status,
          response.statusText,
          metadataLog && `(${metadataLog})`,
        ]
          .filter(Boolean)
          .join(` `)
      )
    },
    // Allow passing of custom configuration to the Contentful SDK like headers
    ...(pluginConfig.get(`contentfulClientConfig`) || {}),
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
    reporter.verbose(`Fetching default locale`)
    space = await client.getSpace()
    locales = await client.getLocales().then(response => response.items)
    defaultLocale = _.find(locales, { default: true }).code
    reporter.verbose(
      `Default locale is: ${defaultLocale}. There are ${locales.length} locales in total.`
    )
  } catch (e) {
    let details
    let errors
    if (e.code === `ENOTFOUND`) {
      details = `You seem to be offline`
    } else if (e.code === `SELF_SIGNED_CERT_IN_CHAIN`) {
      reporter.panic(
        {
          id: CODES.SelfSignedCertificate,
          context: {
            sourceMessage: `We couldn't make a secure connection to your contentful space. Please check if you have any self-signed SSL certificates installed.`,
          },
        },
        e
      )
    } else if (e.responseData) {
      if (e.responseData.status === 404) {
        // host and space used to generate url
        details = `Endpoint not found. Check if ${chalk.yellow(
          `host`
        )} and ${chalk.yellow(`spaceId`)} settings are correct`
        errors = {
          host: `Check if setting is correct`,
          spaceId: `Check if setting is correct`,
        }
      } else if (e.responseData.status === 401) {
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

    reporter.panic({
      context: {
        sourceMessage: `Accessing your Contentful space failed: ${createContentfulErrorMessage(
          e
        )}

Try setting GATSBY_CONTENTFUL_OFFLINE=true to see if we can serve from cache.
${details ? `\n${details}\n` : ``}
Used options:
${formatPluginOptionsForCLI(pluginConfig.getOriginalPluginOptions(), errors)}`,
      },
    })
  }

  let currentSyncData
  const basicSyncConfig = {
    limit: pageLimit,
    resolveLinks: false,
  }
  try {
    syncProgress = reporter.createProgress(
      `Contentful: ${syncToken ? `Sync changed items` : `Sync all items`}`,
      pageLimit,
      0
    )
    syncProgress.start()
    reporter.verbose(`Contentful: Sync ${pageLimit} items per page.`)
    const query = syncToken
      ? { nextSyncToken: syncToken, ...basicSyncConfig }
      : { initial: true, ...basicSyncConfig }
    currentSyncData = await client.sync(query)
  } catch (e) {
    reporter.panic(
      {
        id: CODES.SyncError,
        context: {
          sourceMessage: `Fetching contentful data failed: ${createContentfulErrorMessage(
            e
          )}`,
        },
      },
      e
    )
  } finally {
    syncProgress.done()
  }

  // We need to fetch content types with the non-sync API as the sync API
  // doesn't support this.
  let contentTypes
  try {
    contentTypes = await pagedGet(client, `getContentTypes`, pageLimit)
  } catch (e) {
    reporter.panic(
      {
        id: CODES.FetchContentTypes,
        context: {
          sourceMessage: `Error fetching content types: ${createContentfulErrorMessage(
            e
          )}`,
        },
      },
      e
    )
  }
  reporter.verbose(`Content types fetched ${contentTypes.items.length}`)

  const contentTypeItems = contentTypes.items

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
