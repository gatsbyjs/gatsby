import Router from 'react-router'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import last from 'lodash/last'
import includes from 'underscore.string/include'
import { link } from './gatsby-helpers'

module.exports = (pages, pagesReq) => {
  const templates = {}
  templates.root = Router.createRoute({
    name: 'root-template',
    path: link('/'),
    handler: pagesReq('./_template'),
  })

  // Arrange pages in data structure according to their position
  // on the file system. Then use this to create routes.
  //
  // Algorithm
  // 1. Find all templates.
  // 2. Create routes for each template russian-doll style.
  // 3. For each index file paired with a template, create a default route
  // 4. Create normal routes for each remaining file under the appropriate
  // template
  const templateFiles = filter(pages, (page) =>
    page.file.name === '_template' && page.file.dirname !== ''
  )

  // Find the parent template for each template file and create a route
  // with it.
  templateFiles.forEach((templateFile) => {
    let parentTemplates = filter(templateFiles, (template) =>
      includes(templateFile.requirePath, template.file.dirname)
    )
    // Sort parent templates by directory length. In cases
    // where a template has multiple parents
    // e.g. /_template.js/blog/_template.js/archive/_template.js
    // we want the immediate parent.
    parentTemplates = sortBy(parentTemplates, (template) => {
      if (template) {
        return template.file.dirname.length
      } else {
        return 0
      }
    })
    const parentTemplateFile = last(parentTemplates)
    let parentRoute
    if (parentTemplateFile) {
      parentRoute = templates[parentTemplateFile.file.dirname]
    }

    if (!parentRoute) {
      parentRoute = templates.root
    }

    templates[templateFile.file.dirname] = Router.createRoute({
      name: `${templateFile.file.dirname}-template`,
      path: link(templateFile.templatePath),
      parentRoute,
      handler: pagesReq(`./${templateFile.requirePath}`),
    })
  })

  // Remove files that start with an underscore as this indicates
  // the file shouldn't be turned into a page.
  const filteredPages = filter(pages, (page) => page.file.name.slice(0, 1) !== '_')

  const markdownWrapper = require('wrappers/md')
  const htmlWrapper = require('wrappers/html')

  filteredPages.forEach((p) => {
    const page = p
    // TODO add ways to load data for other file types.
    // Should be able to install a gatsby-toml plugin to add support
    // for TOML. Perhaps everything other than JSX and Markdown should be plugins.
    // Or even they are plugins but they have built-in 'blessed' plugins.
    let handler
    switch (page.file.ext) {
      case 'md':
        handler = markdownWrapper
        page.data = pagesReq(`./${page.requirePath}`)
        break
      case 'html':
        handler = htmlWrapper
        break
      case 'jsx':
        handler = pagesReq(`./${page.requirePath}`)
        page.data = (() => {
          if (pagesReq(`./${page.requirePath}`).metadata) {
            return pagesReq(`./${page.requirePath}`).metadata()
          }
        })()
        break
      case 'cjsx':
        handler = pagesReq(`./${page.requirePath}`)
        page.data = (() => {
          if (pagesReq(`./${page.requirePath}`).metadata) {
            return pagesReq(`./${page.requirePath}`).metadata()
          }
        })()
        break
      default:
        handler = pagesReq(`./${page.requirePath}`)
    }

    // Determine parent template for page.
    let parentRoutes = filter(templateFiles, (templateFile) =>
      includes(page.requirePath, templateFile.file.dirname)
    )

    parentRoutes = sortBy(parentRoutes, (route) => {
      if (route) {
        return route.file.dirname.length
      }
    })

    const parentTemplateFile = last(parentRoutes)
    let parentRoute
    if (parentTemplateFile) {
      parentRoute = templates[parentTemplateFile.file.dirname]
    }

    if (!parentRoute) {
      parentRoute = templates.root
    }

    // If page is an index page *and* in the same directory as a template,
    // it is the default route (for that template).
    if (includes(page.path, '/index') &&
        parentRoute.file.dirname === parentTemplateFile.file.dirname) {
      Router.createDefaultRoute({
        name: page.path,
        parentRoute,
        handler,
      })
    } else {
      Router.createRoute({
        name: page.path,
        path: link(page.path),
        parentRoute,
        handler,
      })
    }
  })

  return templates.root
}
