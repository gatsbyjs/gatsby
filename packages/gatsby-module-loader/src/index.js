/*
  Based on Tobias Koppers @sokra bundle-loader
  https://github.com/webpack/bundle-loader

  and Arthur Stolyar's async-module-loader
*/
const loaderUtils = require(`loader-utils`)

module.exports = function() {}
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable()

  const query = loaderUtils.getOptions(this) || {}
  let chunkName = ``

  if (query.name) {
    chunkName = loaderUtils.interpolateName(this, query.name, {
      context: query.context,
      regExp: query.regExp,
    })
  }

  const request = loaderUtils.stringifyRequest(this, `!!` + remainingRequest)
  const chunkComment = chunkName && `/* webpackChunkName: ${JSON.stringify(chunkName)} */ `

  return `module.exports = () => import(${chunkComment}${request})`
}
