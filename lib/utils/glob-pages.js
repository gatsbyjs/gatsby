import glob from 'glob'
import buildPage from './build-page'
const debug = require('debug')('gatsby:glob')

module.exports = (directory, callback) => {
  const pagesData = []

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
  const globQuery = `${directory}/pages/**/?(${joinedFileQuery})`
  glob(globQuery, null, (err, pages) => {
    if (err) { return callback(err) }

    pages.forEach((page) => {
      pagesData.push(buildPage(directory, page))
    })

    debug(`globbed ${pagesData.length} pages`)
    return callback(null, pagesData)
  })
}
