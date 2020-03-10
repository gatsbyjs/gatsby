import path from "path"
import os from "os"

/**
 * @type {import('../index').urlResolve}
 */
export function urlResolve(...segments: string[]): string {
  const joinedPath = path.join(...segments)
  if (os.platform() === `win32`) {
    return joinedPath.replace(/\\/g, `/`)
  }

  return joinedPath
}
