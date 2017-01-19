// During bootstrap, we write requires at top of this file which looks
// basically like:
// var plugins = [
//   require('/path/to/plugin1/gatsby-browser.js'),
//   require('/path/to/plugin2/gatsby-browser.js'),
// ]

module.exports = (api, args, defaultReturn) => {
  console.log(`running gatsby plugins for api "${api}" with args`, args)

  // Run each plugin in series.
  let results = plugins.map((plugin) => {
    if (plugin.plugin[api]) {
      const result = plugin.plugin[api](args, plugin.options)
      return result
    }
    return false
  })
  console.log(`results`, results)

  // Filter out undefined/falsey results.
  results = results.filter((result) => result)

  if (results.length > 0) {
    return results
  } else {
    return [defaultReturn]
  }
}
