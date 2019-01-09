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

function normalizePath(...parts) {
  const normalized = parts
    .filter(part => part && part.length > 0)
    .map(part => part.replace(/^\/+/, ``).replace(/\/+$/, ``))

  return (
    ((parts[0] || ``).match(/^http/) ? [] : [``])
      .concat(normalized)
      .join(`/`) || `/`
  )
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

function withTrailingSlash(filePath) {
  return `${filePath}/`
}

exports.joinPath = joinPath
exports.normalizePath = normalizePath
exports.withBasePath = withBasePath
exports.withTrailingSlash = withTrailingSlash

exports.withPathPrefix = withPrefix
exports.withAssetPrefix = prefix => withPrefix(prefix, register)
