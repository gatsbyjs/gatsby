// Use a little helper function to remove trailing slashes from paths
exports.removeTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``)

exports.localizedSlug = ({ isDefault, locale, slug }) =>
  isDefault ? `/${slug}` : `/${locale}/${slug}`

// From lodash:
// https://github.com/lodash/lodash/blob/750067f42d3aa5f927604ece2c6df0ff2b2e9d72/findKey.js
exports.findKey = (object, predicate) => {
  let result
  if (object == null) {
    return result
  }
  Object.keys(object).some(key => {
    const value = object[key]
    if (predicate(value, key, object)) {
      result = key
      return true
    }
    return false
  })
  return result
}
