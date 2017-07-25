const path = require(`path`)
const os = require(`os`)

export function joinPath(...paths) {
  const joinedPath = path.join(...paths)
  if (os.platform() === `win32`) {
    return joinedPath.replace(/\\/g, `\\\\`)
  } else {
    return joinedPath
  }
}

export function withBasePath(basePath) {
  return (...paths) => joinPath(basePath, ...paths)
}
