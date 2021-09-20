import path from "path"
import Url from "url"

/**
 * getParsedPath
 * --
 * Parses remote url to a path object
 *
 */
function getParsedPath(url: string): path.ParsedPath {
  return path.parse(Url.parse(url).pathname || ``)
}

/**
 * getRemoteFileExtension
 * --
 * Parses remote url to retrieve remote file extension
 *
 */
export function getRemoteFileExtension(url: string): string {
  return getParsedPath(url).ext
}

/**
 * getRemoteFileName
 * --
 * Parses remote url to retrieve remote file name
 *
 */
export function getRemoteFileName(url: string): string {
  return getParsedPath(url).name
}

/**
 * createFilePath
 * --
 */
export function createFilePath(
  directory: string,
  filename: string,
  ext: string
): string {
  return path.join(directory, `${filename}${ext}`)
}
