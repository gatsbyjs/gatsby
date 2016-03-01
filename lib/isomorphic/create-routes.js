import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import last from 'lodash/last'
import includes from 'underscore.string/include'
import { link } from './gatsby-helpers'

module.exports = (files, pagesReq) => {
  // Remove files that start with an underscore as this indicates
  // the file shouldn't be turned into a page.
  const pages = filter(files, (file) => file.file.name.slice(0, 1) !== '_')
  const templates = filter(files, (file) =>
    file.file.name === '_template'
  )

  const routes = {
    path: link('/'),
    component: pagesReq('./_template'),
    childRoutes: [],
    indexRoute: {},
    pages,
    templates,
  }
  const templatesHash = {}
  templatesHash.root = routes
  templatesHash['/'] = routes

  // Arrange pages in data structure according to their position
  // on the file system. Then use this to create routes.
  //
  // Algorithm
  // 1. Find all templates.
  // 2. Create routes for each template russian-doll style.
  // 3. For each index file paired with a template, create a default route
  // 4. Create normal routes for each remaining file under the appropriate
  // template
  const templatesWithoutRoot = filter(files, (file) =>
    file.file.name === '_template' && file.file.dirname !== ''
  )

  // Find the parent template for each template file and create a route
  // with it.
  templatesWithoutRoot.forEach((templateFile) => {
    let parentTemplates = filter(templatesWithoutRoot, (template) =>
      includes(templateFile.requirePath, template.file.dirname)
    )
    // Sort parent templates by directory length. In cases
    // where a template has multiple parents
    // e.g. /_template.js/blog/_template.js/archive/_template.js
    // we want to nest this template under its most immediate parent.
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
      parentRoute = templatesHash[parentTemplateFile.file.dirname]
    }
    if (!parentRoute) {
      parentRoute = templatesHash.root
    }

    // Create new route for the template.
    const route = {
      path: link(templateFile.templatePath),
      component: pagesReq(`./${templateFile.requirePath}`),
      childRoutes: [],
      indexRoute: {},
      pages,
      templates,
      parentTemplateFile,
    }

    // Add route to the templates object for easy access.
    templatesHash[templateFile.file.dirname] = route

    // Push new route onto its parent.
    parentRoute.childRoutes.push(route)
  })

  const markdownWrapper = require('wrappers/md')
  const htmlWrapper = require('wrappers/html')

  pages.forEach((p) => {
    const page = p
    // TODO add ways to load data for other file types.
    // Should be able to install a gatsby-toml plugin to add support
    // for TOML. Perhaps everything other than JSX and Markdown should be plugins.
    // Or even they are plugins but they have built-in 'blessed' plugins.
    let handler
    switch (page.file.ext) {
      case 'md':
        handler = markdownWrapper
        // TODO figure out if this is redundant as data already added in
        // glob-pages.
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
    const parentTemplates = filter(templatesWithoutRoot, (templateFile) =>
      includes(page.requirePath, templateFile.file.dirname)
    )

    const sortedParentTemplates = sortBy(parentTemplates, (route) => route.file.dirname.length)

    const parentTemplateFile = last(sortedParentTemplates)
    let parentRoute
    if (parentTemplateFile) {
      parentRoute = templatesHash[parentTemplateFile.file.dirname]
    }

    if (!parentRoute) {
      parentRoute = templatesHash.root
    }

    // If page is an index page *and* has the same path as its parentRoute,
    // it is the index route (for that template).
    if (page.file.name === 'index' &&
        link(page.path) === parentRoute.path) {
      parentRoute.indexRoute = {
        component: handler,
        page,
        pages,
        templates,
        parentTemplateFile,
      }
    } else {
      parentRoute.childRoutes.push({
        path: link(page.path),
        component: handler,
        page,
        pages,
        templates,
        parentTemplateFile,
      })
    }
  })

  return routes
}
