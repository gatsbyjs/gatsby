import * as fs from "node:fs";

/**
 * Check if the icon exists on the filesystem
 *
 * @param {String} srcIcon Path of the icon
 */
export function doesIconExist(srcIcon: fs.PathLike): boolean {
  try {
    return fs.statSync(srcIcon).isFile();
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }

    return false;
  }
}
