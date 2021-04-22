const plugins = require(`./api-runner-browser-plugins`)
const {
  getResourceURLsForPathname,
  loadPage,
  loadPageSync,
} = require(`./loader`).publicLoader

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
    const mod = plugin.plugin()

    if (!mod[api]) {
      return undefined
    }

    args.getResourceURLsForPathname = getResourceURLsForPathname
    args.loadPage = loadPage
    args.loadPageSync = loadPageSync

    const result = mod[api](args, plugin.options)
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
    const mod = next.plugin()

    return mod[api]
      ? previous.then(() => mod[api](args, next.options))
      : previous
  }, Promise.resolve())
