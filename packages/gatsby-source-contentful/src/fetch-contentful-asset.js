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
const { HTTPError } = require(`got`)

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
  maxAttempts = 3,
  ...restArgs
}) {
  let attempts = 1
  let delay = 1000

  try {
    const result = await queue.add(async () => {
      while (attempts <= maxAttempts) {
        // Fetch the asset
        try {
          const filename = await fetchRemoteFile({
            url,
            ...restArgs,
          })

          return filename
        } catch (err) {
          // Retry on given status codes
          if (
            (err instanceof HTTPError &&
              statusCodesToRetry.includes(err.response.statusCode)) ||
            (err.code && errorCodesToRetry.includes(err.code))
          ) {
            let logMessage = `Failed to fetch ${url} due to ${
              err.response?.statusCode || err.code
            } error. Attempt #${attempts}.`
            if (attempts === maxAttempts) {
              logMessage = `${logMessage} Retry limit reached. Aborting.`
            }
            reporter.verbose(logMessage)

            // Wait a few seconds before trying again
            await new Promise(resolve => setTimeout(resolve, delay))
            attempts++
            delay = delay * 2
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
    ].join(`\n`)

    // Gather details about what went wrong from the error object and the request
    const details = Object.entries({
      url: err.options?.url,
      method: err.options?.method,
      errorCode: err.code,
      responseStatusCode: err.response?.statusCode,
      responseStatusMessage: err.response?.statusMessage,
      requestHeaders: err.options?.headers,
      responseHeaders: err.response?.headers,
    })
      // Remove undefined values
      .reduce((a, [k, v]) => (v === undefined ? a : ((a[k] = v), a)), {})

    if (Object.keys(details).length) {
      err.message = [
        err.message,
        `Details:`,
        JSON.stringify(details, null, 2),
        `---`,
      ].join(`\n`)
    }

    err.url = url
    err.headers = restArgs.headers
    err.httpOpts = restArgs.httpOpts

    throw err
  }
}
