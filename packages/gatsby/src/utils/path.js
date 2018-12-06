const path = require(`path`)
const os = require(`os`)

const { register } = require(`./asset-path-registry`)

function joinPath(...paths) {
  const joinedPath = path.join(...paths)
  if (os.platform() === `win32`) {
    return joinedPath.replace(/\\/g, `\\\\`)
  } else {
    return joinedPath
  }
}

function withBasePath(basePath) {
  return (...paths) => joinPath(basePath, ...paths)
}

function withPrefix(prefix, callback) {
  return function(...parts) {
    const filePath = path.join(prefix, ...parts)
    if (typeof callback === `function`) {
      callback(filePath)
    }
    return filePath
  }
}

exports.joinPath = joinPath
exports.withBasePath = withBasePath
exports.withPathPrefix = withPrefix

exports.withAssetPrefix = prefix => withPrefix(prefix, register)
