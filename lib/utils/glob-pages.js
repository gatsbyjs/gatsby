import glob from 'glob'
import path from 'path'
import parsePath from 'parse-filepath'
import slash from 'slash'
import fs from 'fs'
import frontMatter from 'front-matter'
import htmlFrontMatter from 'html-frontmatter'
import objectAssign from 'object-assign'
const debug = require('debug')('gatsby:glob')
const gatsbyConfig = path.resolve(process.cwd(), './gatsby.config.js')
const { rewritePath } = require(gatsbyConfig)

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

      // Determine path for page (unless it's a file that starts with an
      // underscore as these don't become pages).
      if (!(parsed.name.slice(0, 1) === '_')) {
        if (data.path) {
          // Path was hardcoded.
          pageData.path = data.path
        } else if (rewritePath) {
          pageData.path = rewritePath(parsed, pageData)
        }

        // If the above didn't set a path, set our own.
        if (!pageData.path) {
          // If this is an index page or template, it's path is /foo/bar/
          if (parsed.name === 'index' || parsed.name === 'template') {
            if (parsed.dirname === '') {
              pageData.path = '/'
            } else {
              pageData.path = `/${parsed.dirname}/`
            }
          // Else if not an index, create a path like /foo/bar/
          // and rely upon static-site-generator-webpack-plugin to add index.html
          } else {
            if (parsed.dirname === '') {
              pageData.path = `/${parsed.name}/`
            } else {
              pageData.path = `/${parsed.dirname}/${parsed.name}/`
            }
          }
        }

      // Set the "template path"
      } else if (parsed.name === '_template') {
        pageData.templatePath = `/${parsed.dirname}/`
      }

      pagesData.push(pageData)
    })

    debug(`globbed ${pagesData.length} pages`)
    return callback(null, pagesData)
  })
}
