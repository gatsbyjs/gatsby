const path = require(`path`)
const Url = require(`url`)
const { createFilePath } = require(`gatsby-core-utils`)

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
  return decodeURIComponent(getParsedPath(url).name)
}

// createFilePath should be imported from `gatsby-core-utils`
// but some plugins already do import it from `gatsby-source-filesystem/utils`
// so just keeping re-export here for backward compatibility
export { createFilePath }
