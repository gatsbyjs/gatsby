// @flow
import path from "path"

module.exports = (filePath: string): string => {
  const { dir, name } = path.parse(filePath)
  const parsedName = name === `index` ? `` : name

  return path.posix.join(`/`, dir, parsedName, `/`)
}
