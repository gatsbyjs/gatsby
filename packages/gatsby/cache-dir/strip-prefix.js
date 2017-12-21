/**
 * Remove a prefix from a string. Return the input string if the given prefix
 * isn't found.
 */
export default (str, prefix = ``) => {
  if (str.startsWith(prefix)) return str.slice(prefix.length)
  return str
}
