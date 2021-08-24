/**
 * This file helps to download huge numbers of assets from the Contentful Image API.
 *
 * It adds a download retry logic, mostly for 503 errors, and ensures we don't request
 * to many asset and asset transformations at once.
 *
 * The caching is handled by fetchRemoteFile
 */

const { fetchRemoteFile } = require(`gatsby-core-utils`)
const { default: PQueue } = require(`p-queue`)
const { range } = require(`lodash`)

/**
 * Contentfuls APIs have a general rate limit of 79 uncached requests per second.
 * A concurrency of 100 was recommended by Contentful backend and will ensure
 * that we won't run into rate-limit errors.
 */
const queue = new PQueue({
  concurrency: 100,
})

// Based on the defaults of https://github.com/JustinBeckwith/retry-axios
const statusCodesToRetry = [...range(100, 200), 429, ...range(500, 600)]
const errorCodesToRetry = [
  `ETIMEDOUT`,
  `ECONNRESET`,
  `EADDRINUSE`,
  `ECONNREFUSED`,
  `EPIPE`,
  `ENOTFOUND`,
  `ENETUNREACH`,
  `EAI_AGAIN`,
]

export async function fetchContentfulAsset({
  url,
  reporter,
  cache,
  maxRetries: maxAttempts = 3,
  ...restArgs
}) {
  let attempts = 1

  try {
    const result = await queue.add(async () => {
      while (attempts <= maxAttempts) {
        // Fetch the asset
        try {
          const filename = await fetchRemoteFile({
            url,
            cache,
            ...restArgs,
          })

          return filename
        } catch (err) {
          // Retry on given status codes
          if (
            (err.statusCode && statusCodesToRetry.includes(err.statusCode)) ||
            (err.code && errorCodesToRetry.includes(err.code))
          ) {
            let logMessage = `Failed to fetch ${url} due to ${
              err.statusCode || err.code
            } error. Attempt #${attempts}.`
            if (attempts === maxAttempts) {
              logMessage = `${logMessage} Retry limit reached. Aborting.`
            }
            reporter.verbose(logMessage)
            attempts++
          } else {
            // Throw all errors without status code or with status code out of retry range
            throw err
          }
        }
      }
      throw new Error(`Exceeded maximum retry attempts (${maxAttempts})`)
    })
    return result
  } catch (err) {
    // Throw user friendly error
    err.message = [
      `Unable to fetch Contentful asset:`,
      url,
      `---`,
      `Reason: ${err.message}`,
      `---`,
      `Details:`,
      JSON.stringify({
        headers: restArgs.headers,
        httpOpts: restArgs.httpOpts,
        code: err.code,
        statusCode: err.statusCode,
        options: err.options,
        request: err.request,
        response: err.response,
      }),
      `---`,
    ].join(`\n`)

    err.url = url
    err.headers = restArgs.headers
    err.httpOpts = restArgs.httpOpts

    throw err
  }
}
