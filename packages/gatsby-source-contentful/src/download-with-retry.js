const axios = require(`axios`)
const rax = require(`retry-axios`)
const { default: PQueue } = require(`p-queue`)

const queue = new PQueue({
  concurrency: 100,
})

export default async function downloadWithRetry(requestConfig, reporter) {
  if (!requestConfig.url) {
    throw new Error(`requestConfig.url is missing`)
  }
  const axiosInstance = axios.create()

  axiosInstance.defaults.raxConfig = {
    instance: axiosInstance,
    onRetryAttempt: err => {
      const cfg = rax.getConfig(err)
      reporter.verbose(
        `Retry attempt #${cfg.currentRetryAttempt} for ${requestConfig.url}`
      )
    },
  }
  rax.attach(axiosInstance)

  try {
    const result = await queue.add(() =>
      axiosInstance.get(requestConfig.url, {
        ...requestConfig,
        // This is required as we should not set `testEnvironment: "node"`
        // in jest.config.js just to test this properly
        adapter: require(`axios/lib/adapters/http`),
      })
    )
    return result
  } catch (err) {
    err.message = `Unable to download asset from ${requestConfig.url}. ${err.message}`
    throw err
  }
}
