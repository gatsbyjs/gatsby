import glob from 'glob'
import path from 'path'
import parsePath from 'parse-filepath'
import slash from 'slash'
import fs from 'fs'
import frontMatter from 'front-matter'
import htmlFrontMatter from 'html-frontmatter'
import objectAssign from 'object-assign'
import pathResolver from './path-resolver'
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
      const pageData = {}
      pageData.file = {}

      pageData.file = parsePath(path.relative(`${directory}/pages`, page))
      const parsed = pageData.file

      pageData.file.ext = parsed.extname.slice(1)
      const ext = pageData.file.ext

      // Determine require path
      pageData.requirePath = slash(path.relative(`${directory}/pages`, page))

      // Make sure slashes on parsed.dirname are correct for Windows
      parsed.dirname = slash(parsed.dirname)

      // Load data for each file type.
      // TODO use webpack-require to ensure data loaded
      // here (in node context) is consistent with what's loaded
      // in the browser.
      let data
      if (ext === 'md') {
        const rawData = frontMatter(fs.readFileSync(page, 'utf-8'))
        data = objectAssign({}, rawData.attributes)
        pageData.data = data
      } else if (ext === 'html') {
        const html = fs.readFileSync(page, 'utf-8')
        data = objectAssign({}, htmlFrontMatter(html), { body: html })
        pageData.data = data
      } else {
        data = {}
      }

      pageData.path = pathResolver(data, parsed)

      // Set the "template path"
      if (parsed.name === '_template') {
        pageData.templatePath = `/${parsed.dirname}/`
      }

      pagesData.push(pageData)
    })

    debug(`globbed ${pagesData.length} pages`)
    return callback(null, pagesData)
  })
}
