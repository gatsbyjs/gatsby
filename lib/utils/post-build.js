/* @flow weak */
import path from 'path'
import glob from 'glob'
import fs from 'fs-extra'
import async from 'async'
import parsePath from 'parse-filepath'
import _ from 'lodash'
import globPages from './glob-pages'

const debug = require('debug')('gatsby:post-build')

module.exports = (program, cb) => {
  const directory = program.directory

  return globPages(directory, (err, pages) => {
    debug('copying files')
    // Async callback to copy each file.
    const copy = function copyFile(file, callback) {
      // Map file to path generated for that directory.
      // e.g. if file is in directory 2015-06-16-my-sweet-blog-post that got
      // rewritten to my-sweet-blog-post, we find that path rewrite so
      // our asset gets copied to the right directory.
      const parsed = parsePath(file)
      const relativePath = path.relative(`${directory}/pages`, file)
      let oldDirectory = parsePath(relativePath).dirname
      let newPath = ''

      // Wouldn't rewrite basePath
      if (oldDirectory === '') {
        oldDirectory = '/'
        newPath = `/${parsed.basename}`
      }

      if (!(oldDirectory === '/')) {
        const page = _.find(pages, p => {
          // Ignore files that start with underscore (they're not pages).
          if (p.file.name.slice(0, 1) !== '_') {
            return parsePath(p.requirePath).dirname === oldDirectory
          } else {
            return false
          }
        })

        if (page) {
          newPath = path.join(parsePath(page.path).path, parsed.basename)
        } else {
          // We couldn't find a page associated with this file. Probably
          // the file is in a directory of static files. In any case,
          // we'll leave the file directory alone.
          newPath = relativePath
        }
      }

      newPath = `${directory}/public/${newPath}`
      return fs.copy(file, newPath, error => callback(error))
    }

    // Copy static assets to public folder.
    const assetTypes =
      '*.jpg|*.jpeg|*.png|*.pdf|*.gif|*.ico|*.svg|*.pdf|*.txt|*.zip|CNAME'
    const globString = `${directory}/pages/**/?(${assetTypes})`
    return glob(globString, { follow: true }, (e, files) =>
      async.map(
        files,
        copy,
        (error, results) =>
          // eslint-disable-next-line comma-dangle
          cb(error, results)
        // eslint-disable-next-line comma-dangle
      )
    )
  })
}
