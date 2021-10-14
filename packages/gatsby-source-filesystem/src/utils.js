const path = require(`path`)
const Url = require(`url`)

/**
 * getParsedPath
 * --
 * Parses remote url to a path object
 *
 *
 * @param  {String}          url
 * @return {Object}          path
 */
function getParsedPath(url) {
  return path.parse(Url.parse(url).pathname)
}

/**
 * getRemoteFileExtension
 * --
 * Parses remote url to retrieve remote file extension
 *
 *
 * @param  {String}          url
 * @return {String}          extension
 */
export function getRemoteFileExtension(url) {
  return getParsedPath(url).ext
}

/**
 * getRemoteFileName
 * --
 * Parses remote url to retrieve remote file name
 *
 *
 * @param  {String}          url
 * @return {String}          filename
 */
export function getRemoteFileName(url) {
  return getParsedPath(url).name
}

/**
 * createFilePath
 * --
 *
 * @param  {String} directory
 * @param  {String} filename
 * @param  {String} ext
 * @return {String}
 */
export function createFilePath(directory, filename, ext) {
  return path.join(directory, `${filename}${ext}`)
}
