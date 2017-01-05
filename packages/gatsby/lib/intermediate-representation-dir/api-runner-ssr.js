// During bootstrap, we write requires at top of this file which looks
// basically like:
// var plugins = [
//   require('/path/to/plugin1/gatsby-ssr.js'),
//   require('/path/to/plugin2/gatsby-ssr.js'),
// ]

module.exports = (api, args, defaultReturn) => {
  // Run each plugin in series.
  let results = plugins.map((plugin) => {
    if (plugin[api]) {
      const result = plugin[api](args)
      return result
    }
  })
  console.log(`ssr plugin results`, results)

  // Filter out undefined/falsey results.
  results = results.filter((result) => result)
  console.log(`filtered results`, results)

  if (results.length > 0) {
    console.log(`returning results`)
    return results
  } else {
    console.log(`returning defaultReturn`)
    return [defaultReturn]
  }
}
