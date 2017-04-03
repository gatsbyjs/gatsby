// @flow
import parsePath from "parse-filepath"
import path from "path"

module.exports = (basePath: string, filePath: string): string => {
  const relativePath = path.relative(basePath, filePath)
  const parsedPath = parsePath(relativePath)
  const { dirname } = parsedPath
  let { name } = parsedPath
  if (name === `index`) {
    name = ``
  }

  const pagePath = path.posix.join(`/`, dirname, name, `/`)

  return pagePath
}
