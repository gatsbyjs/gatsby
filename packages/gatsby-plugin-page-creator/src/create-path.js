// @flow
import parsePath from "parse-filepath"
import path from "path"

module.exports = (filePath: string): string => {
  const { dirname, name } = parsePath(filePath)
  const parsedName = name === `index` ? `` : name

  return path.posix.join(`/`, dirname, parsedName, `/`)
}
