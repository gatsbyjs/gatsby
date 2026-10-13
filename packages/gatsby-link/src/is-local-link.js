const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//

function isAbsolute(path) {
  return ABSOLUTE_URL_REGEX.test(path)
}

export function isLocalLink(path) {
  if (typeof path !== `string`) {
    return undefined
  }
  if (!path) return false
  return !isAbsolute(path)
}
