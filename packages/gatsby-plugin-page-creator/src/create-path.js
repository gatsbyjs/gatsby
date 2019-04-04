// @flow
import path from "path"

module.exports = (filePath: string): string => {
  const { dirname, name } = path.parse(filePath)
  const parsedName = name === `index` ? `` : name

  return path.posix.join(`/`, dirname, parsedName, `/`)
}
