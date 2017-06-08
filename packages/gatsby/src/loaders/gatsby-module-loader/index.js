/*
  Based on Tobias Koppers @sokra bundle-loader
  https://github.com/webpack/bundle-loader

  and Arthur Stolyar's async-module-loader
*/
const loaderUtils = require(`loader-utils`)
const path = require(`path`)
console.log("in gatsby-module-loader")

module.exports = function() {}
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable()

  console.log("this.query", this.query)
  const query = loaderUtils.parseQuery(this.query)
  console.log("query", query)
  let chunkName = ``

  if (query.name) {
    chunkName = loaderUtils.interpolateName(this, query.name, {
      context: query.context,
      regExp: query.regExp,
    })
    chunkName = `, ${JSON.stringify(chunkName)}`
  }

  console.log(`chunkName`, chunkName)

  const request = loaderUtils.stringifyRequest(this, `!!` + remainingRequest)

  const callback = "callback(function() { return require(" + request + ") })"

  const executor = `
    return function(callback, errback) {
      require.ensure([], function(_, error) {
        if (error) {
          errback()
        } else {
          ${callback}
        }
      }${chunkName});
    }`

  const result = `
    require(
      ${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, `patch.js`)}`
      )}
    );
    module.exports = function() { ${executor} }
    `

  console.log(`result`, result)

  return result
}
