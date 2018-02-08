// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   require('/path/to/plugin1/gatsby-ssr.js'),
//   require('/path/to/plugin2/gatsby-ssr.js'),
// ]

const apis = require(`./api-ssr-docs`)

/**
 * Some apis should only be implemented once. Given a list of plugins, and an
 * `api` to check, this will return [] for apis that are implemented 1 or 0 times.
 *
 * For apis that have been implemented multiple times, return an array of paths
 * pointing to the file implementing `api`.
 *
 * @param {array} pluginList
 * @param {string} api
 */
const duplicatedApis = (pluginList, api) => {
  let implementsApi = []

  pluginList.forEach(p => {
    if (p.plugin[api]) implementsApi.push(p.path)
  })

  if (implementsApi.length < 2) return [] // no dupes
  return implementsApi // paths to dupes
}

// Run the specified api in any plugins that have implemented it
const apiRunner = (api, args, defaultReturn) => {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  if (api === `replaceRenderer`) {
    const dupes = duplicatedApis(plugins, api)
    if (dupes.length > 0) {
      let m = `\nThe "${api}" api has been implemented multiple times. Only the last implementation will be used.`
      let m2 = `This is probably an error, see https://github.com/gatsbyjs/gatsby/issues/2005#issuecomment-326787567 for workarounds.`
      console.log(m)
      console.log(m2)
      console.log(`Check the following files for "${api}" implementations:`)
      dupes.map(d => console.log(d))
    }
  }

  // Run each plugin in series.
  let results = plugins.map(plugin => {
    if (plugin.plugin[api]) {
      const result = plugin.plugin[api](args, plugin.options)
      return result
    }
  })

  // Filter out undefined results.
  results = results.filter(result => typeof result !== `undefined`)

  if (results.length > 0) {
    return results
  } else {
    return [defaultReturn]
  }
}

exports.apiRunner = apiRunner
exports.duplicatedApis = duplicatedApis
