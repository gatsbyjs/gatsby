/**
 * Remove a prefix from a string. Return the input string if the given prefix
 * isn't found.
 */

// Polyfill startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(search, pos) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search
  }
}

export default (str, prefix = ``) => {
  if (str.startsWith(prefix)) return str.slice(prefix.length)
  return str
}
