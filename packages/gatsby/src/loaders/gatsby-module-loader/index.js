/*
  Based on Tobias Koppers @sokra bundle-loader
  https://github.com/webpack/bundle-loader

  and Arthur Stolyar's async-module-loader
*/
const loaderUtils = require(`loader-utils`)
const path = require(`path`)

module.exports = function() {}
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable()

  const query = loaderUtils.parseQuery(this.query)
  let chunkName = ``

  if (query.name) {
    chunkName = loaderUtils.interpolateName(this, query.name, {
      context: query.context,
      regExp: query.regExp,
    })
    chunkName = `, ${JSON.stringify(chunkName)}`
  }

  const request = loaderUtils.stringifyRequest(this, `!!` + remainingRequest)

  const callback = `function() { return require(` + request + `) }`

  const executor = `
     return require.ensure([], function(_, error) {
        if (error) {
          cb(true)
        } else {
          cb(null, ${callback})
        }
      }${chunkName});
    `

  const result = `
    require(
      ${loaderUtils.stringifyRequest(
        this,
        `!${path.join(__dirname, `patch.js`)}`
      )}
    );
    module.exports = function(cb) { ${executor} }
    `

  return result
}
