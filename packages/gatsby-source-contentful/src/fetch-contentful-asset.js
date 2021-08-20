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
          // Skip cache to to force a new network request to the asset
          const filename = await fetchRemoteFile({
            url,
            cache,
            ...restArgs,
          })

          return filename
        } catch (err) {
          // Retry on given status codes
          if (err.statusCode && statusCodesToRetry.includes(err.statusCode)) {
            let logMessage = `Failed to fetch ${url} due to ${err.statusCode} error. Failed after attempt #${attempts}.`
            if (attempts === maxAttempts) {
              logMessage = `${logMessage} Aborting.`
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
    err.message = `Unable to fetch asset from ${url}. ${err.message}`
    throw err
  }
}
