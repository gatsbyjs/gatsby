import path from "path"
import crypto from "crypto"
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
  return decodeURIComponent(getParsedPath(url).name)
}

export function createFileHash(input: string, length: number = 8): string {
  return crypto
    .createHash(`sha1`)
    .update(input)
    .digest(`hex`)
    .substring(0, length)
}

const filenamePurgeRegex = /:|\/|\*|\?|"|<|>|\||\\/g

/**
 * createFilePath
 * --
 * Gets full file path while replacing forbidden characters with a `-`
 */
export function createFilePath(
  directory: string,
  filename: string,
  ext: string
): string {
  directory = decodeURIComponent(directory)
  filename = decodeURIComponent(filename)

  const purgedFileName = filename.replace(filenamePurgeRegex, `-`)
  const shouldAddHash = purgedFileName !== filename

  if (shouldAddHash) {
    return path.join(
      directory,
      `${purgedFileName}-${createFileHash(filename)}${ext}`
    )
  } else {
    return path.join(directory, `${filename}${ext}`)
  }
}
