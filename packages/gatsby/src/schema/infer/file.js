const path = require(`path`)

const { getAbsolutePath, getValueAtSelector } = require(`../utils`)
const { getNodesByType } = require(`../db`)

const getValueAt = (selector, node) => {
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

  const looksLikeFile = !path.isAbsolute(relativePath)
  // mime.getType(relativePath) !== null &&
  // require('is-relative')(relativePath) &&
  // require('is-relative-url')(relativePath);

  if (!looksLikeFile) return null

  const node = getNodesByType(typeName).find(
    node => getValueAt(selector, node) === relativePath
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
