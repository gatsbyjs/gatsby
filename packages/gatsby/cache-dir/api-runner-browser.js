const plugins = require(`./api-runner-browser-plugins`)
const {
  getResourceURLsForPathname,
  loadPage,
  loadPageSync,
} = require(`./loader`).publicLoader

function getApi(api, plugin) {
  if (plugin[api]) {
    return plugin[api]
  }

  if (api === `wrapPageElement`) {
    return plugin[`WrapPageElement`]
  } else if (api === `wrapRootElement`) {
    return plugin[`WrapRootElement`]
  }

  return false
}

exports.apiRunner = (api, args = {}, defaultReturn, argTransform) => {
  // Hooks for gatsby-cypress's API handler
  if (process.env.CYPRESS_SUPPORT) {
    if (window.___apiHandler) {
      window.___apiHandler(api)
    } else if (window.___resolvedAPIs) {
      window.___resolvedAPIs.push(api)
    } else {
      window.___resolvedAPIs = [api]
    }
  }

  let results = plugins.map(plugin => {
    const apiToRun = getApi(api, plugin.plugin)
    if (!apiToRun) {
      return undefined
    }
    // if (!plugin.plugin[api]) {
    //   return undefined
    // }

    args.getResourceURLsForPathname = getResourceURLsForPathname
    args.loadPage = loadPage
    args.loadPageSync = loadPageSync

    const result = apiToRun(args, plugin.options)
    if (result && argTransform) {
      args = argTransform({ args, result, plugin })
    }
    return result
  })

  // Filter out undefined results.
  results = results.filter(result => typeof result !== `undefined`)

  if (results.length > 0) {
    return results
  } else if (defaultReturn) {
    return [defaultReturn]
  } else {
    return []
  }
}

exports.apiRunnerAsync = (api, args, defaultReturn) =>
  plugins.reduce((previous, next) => {
    const apiToRun = getApi(api, next.plugin)

    return apiToRun
      ? previous.then(() => apiToRun(args, next.options))
      : previous
  }, Promise.resolve())
