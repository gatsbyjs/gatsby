export const normalizePath = path => {
  if (path.endsWith(`/`)) {
    path = path.slice(0, -1)
  }

  if (!path.startsWith(`/`)) {
    path = `/${path}`
  }

  return path
}

/**
 * This is temporary until we can get a path field from MenuItems https://github.com/wp-graphql/wp-graphql/issues/1137
 *
 * https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
 */
export const getUrlPath = url => {
  const parser = document.createElement(`a`)
  parser.href = url

  return normalizePath(parser.pathname)
}
