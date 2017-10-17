// @flow
import parsePath from "parse-filepath"
import path from "path"
import slash from "slash"

module.exports = (basePath: string, filePath: string): string => {
  const relativePath = path.posix.relative(slash(basePath), slash(filePath))
  const { dirname, name } = parsePath(relativePath)
  return path.posix.join(dirname, name)
}
