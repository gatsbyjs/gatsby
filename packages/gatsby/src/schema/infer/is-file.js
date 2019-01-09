const path = require(`path`)

const { getAbsolutePath, getValueAtSelector } = require(`../utils`)
const { getNodesByType } = require(`../db`)

const getValueAt = (node, selector) => {
  let value = getValueAtSelector(node, selector)
  while (Array.isArray(value)) {
    value = value[0]
  }
  return value
}

// TODO: Do we need to do anything special for Windows paths?
const getFilePath = (field, relativePath) => {
  const [typeName, ...selector] = field.split(`.`)

  if (typeName === `File`) return null

  const mime = require(`mime`)
  const isRelative = require(`is-relative`)
  const isRelativeUrl = require(`is-relative-url`)
  const looksLikeFile =
    !path.isAbsolute(relativePath) &&
    // FIXME: Do we need all of this?
    mime.getType(relativePath) !== null &&
    mime.getType(relativePath) !== `application/x-msdownload` &&
    isRelative(relativePath) &&
    isRelativeUrl(relativePath)

  if (!looksLikeFile) return null

  const node = getNodesByType(typeName).find(
    node => getValueAt(node, selector) === relativePath
  )

  return node ? getAbsolutePath(node, relativePath) : null
}

const isFile = (field, relativePath) => {
  const filePath = getFilePath(field, relativePath)
  const filePathExists =
    filePath &&
    getNodesByType(`File`).some(node => node.absolutePath === filePath)
  return filePathExists
}

module.exports = {
  isFile,
}
