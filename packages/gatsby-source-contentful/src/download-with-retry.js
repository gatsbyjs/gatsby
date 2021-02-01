const axios = require(`axios`)
const rax = require(`retry-axios`)
const { default: PQueue } = require(`p-queue`)

const queue = new PQueue({
  concurrency: 100,
})

const RetryAxios = axios.create()

export default async function downloadWithRetry(requestConfig, reporter) {
  if (!requestConfig.url) {
    throw new Error(`requestConfig.url is missing`)
  }

  RetryAxios.defaults.raxConfig = {
    instance: RetryAxios,
    onRetryAttempt: err => {
      const cfg = rax.getConfig(err)
      reporter.verbose(
        `Retry attempt #${cfg.currentRetryAttempt} for ${requestConfig.url}`
      )
    },
  }

  rax.attach(RetryAxios)

  try {
    const result = await queue.add(() =>
      RetryAxios.get(requestConfig.url, requestConfig)
    )
    return result
  } catch (err) {
    err.message = `Unable to download asset from ${requestConfig.url}. ${err.message}`
    throw err
  }
}
