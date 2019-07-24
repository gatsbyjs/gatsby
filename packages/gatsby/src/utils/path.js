const { joinPath } = require(`gatsby-core-utils`)

export function withBasePath(basePath) {
  return (...paths) => joinPath(basePath, ...paths)
}

export function withTrailingSlash(basePath) {
  return `${basePath}/`
}
