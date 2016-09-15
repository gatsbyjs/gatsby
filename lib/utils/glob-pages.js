/* @flow weak */
import glob from 'glob'
import buildPage from './build-page'
const debug = require('debug')('gatsby:glob')

import pageFileTypes from './page-file-types'

function globQuery (pagesPath) {
  const fileGlobQuery = pageFileTypes.map((type) => `*.${type}`)
  const joinedFileQuery = fileGlobQuery.join('|')
  return `${pagesPath}/**/?(${joinedFileQuery})`
}

let globCache
function createCache (pagesPath, callback) {
  const pagesData = []

  glob(globQuery(pagesPath), null, (err, pages) => {
    if (err) { return callback(err) }

    pages.forEach((page) => {
      pagesData.push(buildPage(pagesPath, page))
    })

    debug(`globbed ${pagesData.length} pages`)
    globCache = pagesData
    return callback(null, pagesData)
  })
}

module.exports = function globPages (pagesPath, callback) {
  if (typeof globCache === 'undefined') {
    createCache(pagesPath, callback)
  } else {
    callback(null, globCache)
  }
}
