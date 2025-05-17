// Copied from https://github.com/sindresorhus/is-absolute-url/blob/3ab19cc2e599a03ea691bcb8a4c09fa3ebb5da4f/index.js
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/
const isAbsolute = path => ABSOLUTE_URL_REGEX.test(path)

export function isLocalLink(path) {
  // Handle null/undefined case
  if (!path) throw new TypeError(`Expected a \`string\`, got \`${typeof path}\``)
  if (/^(?:[a-z+]+:)?\/\//i.test(path)) {
    return false
  }
  // If it's not a protocol-based URL, it's likely a local link
  return true
}
