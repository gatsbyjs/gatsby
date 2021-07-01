/* global plugins */
// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   {
//     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
//     options: { ... },
//   },
//   {
//     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
//     options: { ... },
//   },
// ]

const apis = require(`./api-ssr-docs`)

// Run the specified API in any plugins that have implemented it
module.exports = (api, args, defaultReturn, argTransform) => {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  function augmentErrorWithPlugin(plugin, err) {
    if (plugin.name !== `default-site-plugin`) {
      // default-site-plugin is user code and will print proper stack trace,
      // so no point in annotating error message pointing out which plugin is root of the problem
      err.message += ` (from plugin: ${plugin.name})`
    }

    throw err
  }

  // Run each plugin in series.
  const results = []
  plugins.forEach(plugin => {
    const apiFn = plugin.plugin[api]
    if (!apiFn) {
      return
    }

    try {
      let result = apiFn(args, plugin.options)

      if (result && argTransform) {
        if (result instanceof Promise) {
          result
            .then(res => argTransform({ args, result: res }))
            .catch(err => augmentErrorWithPlugin(plugin, err))
        } else {
          result = argTransform({ args, result })
        }
      }

      // This if case keeps behaviour as before, we should allow undefined here as the api is defined
      // TODO V4
      if (typeof result !== `undefined`) {
        results.push(result)
      }
    } catch (e) {
      augmentErrorWithPlugin(plugin, e)
    }
  })

  // Plugins can use replaceRenderer to render React and extract pieces out of the HTML.
  // For example, emotion does it. We have to make it async to allow async rendering in React.
  if (api === `replaceRenderer`) {
    return Promise.all(results).then(asyncResults =>
      asyncResults.length ? asyncResults : [defaultReturn]
    )
  }

  return results.length ? results : [defaultReturn]
}
