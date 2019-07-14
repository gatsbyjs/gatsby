const path = require(`path`)
const os = require(`os`)

/**
 * @type {import('../index').urlResolve}
 */
export function resolve(...segments) {
  const joinedPath = path.join(...segments)
  if (os.platform() === `win32`) {
    return joinedPath.replace(/\\/g, `/`)
  }

  return joinedPath
}
