exports.__esModule = true
exports.getRemoteFileExtension = getRemoteFileExtension
exports.getRemoteFileName = getRemoteFileName
exports.createProgress = createProgress
exports.createFilePath = createFilePath

const path = require(`path`)

const Url = require(`url`)

const ProgressBar = require(`progress`)
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

function getRemoteFileExtension(url) {
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

function getRemoteFileName(url) {
  return getParsedPath(url).name
} // TODO remove in V3

function createProgress(message, reporter) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message)
  }

  const bar = new ProgressBar(
    ` [:bar] :current/:total :elapsed s :percent ${message}`,
    {
      total: 0,
      width: 30,
      clear: true,
    }
  )
  return {
    start() {},

    tick() {
      bar.tick()
    },

    done() {},

    set total(value) {
      bar.total = value
    },
  }
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

function createFilePath(directory, filename, ext) {
  return path.join(directory, `${filename}${ext}`)
}
