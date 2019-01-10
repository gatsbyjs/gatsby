const path = require(`path`)
const slash = require(`slash`)

const { getAbsolutePath, getValueAtSelector } = require(`../utils`)
const { getNodesByType } = require(`../db`)

const getFirstValueAt = (node, selector) => {
  let value = getValueAtSelector(node, selector)
  while (Array.isArray(value)) {
    value = value[0]
  }
  return value
}

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
    node => getFirstValueAt(node, selector) === relativePath
  )

  return node ? getAbsolutePath(node, relativePath) : null
}

const isFile = (field, relativePath) => {
  const normalizedPath = slash(relativePath)
  const filePath = getFilePath(field, normalizedPath)
  if (!filePath) return false
  const normalizedFilePath = slash(filePath)
  const filePathExists = getNodesByType(`File`).some(
    node => node.absolutePath === normalizedFilePath
  )
  return filePathExists
}

module.exports = {
  isFile,
}
