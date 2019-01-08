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
  prefix = typeof prefix === `undefined` || prefix === `` ? `/` : prefix
  return function join(...parts) {
    const filePath = [prefix].concat(parts).join(`/`)
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
