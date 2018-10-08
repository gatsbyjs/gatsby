const _ = require("lodash")
/**
 * Defines how a theme object is merged with the user's config
 */
module.exports = (a, b) =>
  _.uniq(Object.keys(a).concat(Object.keys(b))).reduce((acc, key) => {
    const mergeFn = mergeAlgo[key]
    acc[key] = mergeFn ? mergeFn(a[key], b[key]) : b[key] || a[key]
    return acc
  }, {})

const mergeAlgo = {
  siteMetadata: (a, b) => _.merge({}, a, b),
  plugins: (a = [], b = []) => a.concat(b),
  mapping: (a, b) => _.merge({}, a, b),
}
