/* @flow weak */
import glob from 'glob'
import buildPage from './build-page'
const debug = require('debug')('gatsby:glob')

function globQuery (directory) {
  // Make this list easy to modify through the config?
  // Or just keep adding extensions...?
  const fileTypesToGlob = [
    'coffee',
    'cjsx',
    'jsx',
    'js',
    'md',
    'html',
    'json',
    'yaml',
    'toml',
  ]
  const fileGlobQuery = fileTypesToGlob.map((type) => `*.${type}`)
  const joinedFileQuery = fileGlobQuery.join('|')
  return `${directory}/pages/**/?(${joinedFileQuery})`
}

let globCache
function createCache (directory, callback) {
  const pagesData = []

  glob(globQuery(directory), null, (err, pages) => {
    if (err) { return callback(err) }

    pages.forEach((page) => {
      pagesData.push(buildPage(directory, page))
    })

    debug(`globbed ${pagesData.length} pages`)
    globCache = pagesData
    return callback(null, pagesData)
  })
}

module.exports = function globPages (directory, callback) {
  if (typeof globCache === 'undefined') {
    createCache(directory, callback)
  } else {
    callback(null, globCache)
  }
}
