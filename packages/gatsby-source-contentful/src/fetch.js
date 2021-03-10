const contentful = require(`contentful`)
const _ = require(`lodash`)
const chalk = require(`chalk`)
const { formatPluginOptionsForCLI } = require(`./plugin-options`)
const { CODES } = require(`./report`)

module.exports = async function contentfulFetch({
  syncToken,
  pluginConfig,
  reporter,
}) {
  // Fetch articles.
  let syncProgress
  let syncItemCount = 0
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
        if (process.env.gatsby_log_level === `verbose`) {
          return ``
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

      // Log error and throw it in an extended shape
      if (response.isAxiosError) {
        reporter.verbose(
          `${response.config.method} /${response.config.url}: ${
            response.response.status
          } ${response.response.statusText} (${createMetadataLog(
            response.response
          )})`
        )
        let errorMessage = `${response.response.status} ${response.response.statusText}`
        if (response.response?.data?.message) {
          errorMessage += `\n\n${response.response.data.message}`
        }
        const contentfulApiError = new Error(errorMessage)
        // Special response naming to ensure the error object is not touched by
        // https://github.com/contentful/contentful.js/commit/41039afa0c1462762514c61458556e6868beba61
        contentfulApiError.responseData = response.response
        contentfulApiError.request = response.request
        contentfulApiError.config = response.config

        throw contentfulApiError
      }

      // Sync progress
      if (response.config.url === `sync`) {
        syncItemCount += response.data.items.length
        syncProgress.total = syncItemCount
        syncProgress.tick(response.data.items.length)
      }

      reporter.verbose(
        `${response.config.method} /${response.config.url}: ${
          response.status
        } ${response.statusText} (${createMetadataLog(response)})`
      )
    },
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
        sourceMessage: `Accessing your Contentful space failed: ${e.message}
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
          sourceMessage: `Fetching contentful data failed: ${e.message}`,
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
          sourceMessage: `Error fetching content types: ${e.message}`,
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
