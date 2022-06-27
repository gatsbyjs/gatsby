// forked from https://github.com/mayinbun/urling/blob/master/src/index.js

const http = require("http")
const https = require("https")

const defaultOptions = {
  retry: 3,
  interval: 5000,
  immediate: false,
}

module.exports = async function (options = { url: "" }) {
  const _options = defaultOptions
  let retryCount = 0
  let available = false

  if (typeof options === "string") _options.url = options
  else Object.assign(_options, options)

  return new Promise((resolve, reject) => {
    function init() {
      if (_options.immediate) execute() && retryCount--
      const interval = setInterval(execute, _options.interval)

      async function execute() {
        console.info(`waiting for [${_options.url}] to be available...`)

        available = await ping(_options.url)

        retryCount++

        if (available) {
          clearInterval(interval)
          resolve(available)
          console.info(`ping to [${_options.url}] successful`)
        }

        if (retryCount === _options.retry) {
          clearInterval(interval)
          reject(available)
          console.info(`retried ${_options.retry} times with no success`)
        }
      }
    }

    init()
  })
}

async function ping(url) {
  const isHttps = url.startsWith("https")
  const protocol = isHttps ? https : http

  return new Promise((resolve, reject) => {
    return protocol
      .get(url, response => {
        const code = response.statusCode
        return resolve(code >= 200 && code < 300)
      })
      .on("error", e => {
        return resolve(0)
      })
  })
}
