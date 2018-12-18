const path = require(`path`)
const fs = require(`fs`)
const anymatch = require(`anymatch`)
const isGlob = require(`is-glob`)
const globParent = require(`glob-parent`)
const Url = require(`url`)

export function normalizePaths(paths) {
  paths = [].concat(paths)
  return paths.reduce((acc, p) => acc.concat(p), []).map(p => {
    p = isGlob(p) ? globParent(p) : p
    // Validate that the path is absolute.
    // Absolute paths are required to resolve images correctly.
    if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), p)
    return p
  })
}

export function pathsExist(paths, ignore) {
  const isIgnored = anymatch(ignore)
  paths = [].concat(paths)
  return paths.filter(f => !isIgnored(f)).every(p => fs.existsSync(p))
}

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
