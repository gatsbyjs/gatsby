const path = require(`path`)

const getBaseDir = require(`./get-base-dir`)

const getAbsolutePath = (node, relativePath) => {
  const dir = getBaseDir(node)
  return dir
    ? Array.isArray(relativePath)
      ? relativePath.map(p => path.join(dir, p))
      : path.join(dir, relativePath)
    : null
}

module.exports = getAbsolutePath
