const axios = require(`axios`)
const rax = require(`retry-axios`)
const { default: PQueue } = require(`p-queue`)

/**
 * Contentfuls APIs have a general rate limit of 79 uncached requests per second.
 * A concurrency of 100 was recommended by Contentful backend and will ensure
 * that we won't run into rate-limit errors.
 */
const queue = new PQueue({
  concurrency: 100,
})

let RetryAxios

function getAxios(reporter) {
  if (!RetryAxios) {
    RetryAxios = axios.create()

    RetryAxios.defaults.raxConfig = {
      instance: RetryAxios,
      onRetryAttempt: err => {
        const cfg = rax.getConfig(err)
        reporter.verbose(
          `Retry attempt #${cfg.currentRetryAttempt} for ${err.config.url}`
        )
      },
    }

    rax.attach(RetryAxios)
  }
  return RetryAxios
}

export default async function downloadWithRetry(requestConfig, reporter) {
  if (!requestConfig.url) {
    throw new Error(`requestConfig.url is missing`)
  }

  const axiosInstance = getAxios(reporter)

  try {
    const result = await queue.add(() =>
      axiosInstance.get(requestConfig.url, requestConfig)
    )
    return result
  } catch (err) {
    err.message = `Unable to download asset from ${requestConfig.url}. ${err.message}`
    throw err
  }
}
