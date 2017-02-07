import parsePath from "parse-filepath"
import path from "path"

module.exports = (basePath, filePath) => {
  const relativePath = path.relative(basePath, filePath)
  const parsedPath = parsePath(relativePath)
  const { dirname } = parsedPath
  let { name } = parsedPath
  if (name === `index`) {
    name = ``
  }

  const pagePath = path.join(`/`, dirname, name, `/`)

  return pagePath
}
