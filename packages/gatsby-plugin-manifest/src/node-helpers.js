import * as fs from "fs"

/**
 * Check if the icon exists on the filesystem
 *
 * @param {String} srcIcon Path of the icon
 */
export function doesIconExist(srcIcon) {
  try {
    return fs.statSync(srcIcon).isFile()
  } catch (e) {
    if (e.code !== `ENOENT`) {
      throw e
    }

    return false
  }
}
