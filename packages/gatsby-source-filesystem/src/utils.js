const path = require(`path`)
const Url = require(`url`)

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
  return path.parse(Url.parse(url).pathname).ext
}
