// @flow
import parsePath from "parse-filepath"
import path from "path"

module.exports = (basePath: string, filePath: string): string => {
  const relativePath = path.posix.relative(basePath, filePath)
  const parsedPath = parsePath(relativePath)
  const { dirname } = parsedPath
  let { name } = parsedPath
  if (name === `index`) {
    name = ``
  }

  // Use path.posix to force forward slash paths. Otherwise on windows
  // node.js will add backward slashes.
  const pagePath = path.posix.join(`/`, dirname, name, `/`)

  return pagePath
}
