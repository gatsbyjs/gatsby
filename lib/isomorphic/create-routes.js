/* @flow weak */
import filter from 'lodash/filter'
import last from 'lodash/last'
import sortBy from 'lodash/sortBy'
import { prefixLink } from './gatsby-helpers'

function requireComponent (moduleReq) {
  // Minor differences in `require` behavior across languages
  // are handled by this wrapper.
  //
  // If `moduleReq` is a typescript module (versus javascript/coffeescript)
  // an object with a `default` property is returned rather than the
  // default export.
  let module = moduleReq
  if (module.default) {
    module = module.default
  }
  return module
}

module.exports = (files, pagesReq) => {
  // Remove files that start with an underscore as this indicates
  // the file shouldn't be turned into a page.
  const pages = filter(files, file => file.file.name.slice(0, 1) !== '_')
  const templates = filter(files, file =>
    // eslint-disable-next-line comma-dangle
    file.file.name === '_template'
  )

  const routes = {
    path: prefixLink('/'),
    component: requireComponent(require('pages/_template')),
    childRoutes: [],
    indexRoute: {},
    pages,
    templates,
  }
  let notFound = null
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
  const templatesWithoutRoot = filter(files, file =>
    // eslint-disable-next-line comma-dangle
    file.file.name === '_template' && file.file.dirname !== ''
  )

  // Find the parent template for each template file and create a route
  // with it.
  templatesWithoutRoot.forEach((templateFile) => {
    let parentTemplates = filter(templatesWithoutRoot, template =>
      // eslint-disable-next-line comma-dangle
      templateFile.requirePath.indexOf(template.file.dirname) === 0
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
      path: prefixLink(templateFile.templatePath),
      component: requireComponent(pagesReq(`./${templateFile.requirePath}`)),
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

  const staticFileTypes = [
    'ipynb',
    'md',
    'rmd',
    'mkd',
    'mkdn',
    'mdwn',
    'mdown',
    'markdown',
    'litcoffee',
    'html',
    'json',
    'yaml',
    'toml',
  ]
  const reactComponentFileTypes = [
    'js',
    'ts',
    'jsx',
    'tsx',
    'cjsx',
  ]
  const wrappers = {}
  staticFileTypes.forEach((type) => {
    try {
      // $FlowIssue - https://github.com/facebook/flow/issues/1975
      wrappers[type] = require(`wrappers/${type}`)
    } catch (e) {
      // Ignore module not found errors; show others on console
      if (e.code !== 'MODULE_NOT_FOUND'
          && (e.message && !e.message.match(/^Cannot find module/))
          && typeof console !== 'undefined') {
        console.error('Error requiring wrapper', type, ':', e)
      }
    }
  })

  pages.forEach((p) => {
    const page = p
    let handler
    if (staticFileTypes.indexOf(page.file.ext) !== -1) {
      handler = wrappers[page.file.ext]
      page.data = pagesReq(`./${page.requirePath}`)
    } else if (reactComponentFileTypes.indexOf(page.file.ext) !== -1) {
      handler = pagesReq(`./${page.requirePath}`)
      page.data = page.data = (page.data === undefined) ? {} : page.data
    }

    // Determine parent template for page.
    const parentTemplates = filter(templatesWithoutRoot, templateFile =>
      // eslint-disable-next-line comma-dangle
      page.requirePath.indexOf(templateFile.file.dirname) === 0
    )

    const sortedParentTemplates = sortBy(parentTemplates, route => route.file.dirname.length)

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
        prefixLink(page.path) === parentRoute.path) {
      parentRoute.indexRoute = {
        component: handler,
        page,
        pages,
        templates,
        parentTemplateFile,
      }
    } else {
      parentRoute.childRoutes.push({
        path: prefixLink(page.path),
        component: handler,
        page,
        pages,
        templates,
        parentTemplateFile,
      })
    }

    if (page.path.indexOf('/404') !== -1) {
      notFound = {
        path: '*',
        component: handler,
        page,
        pages,
        templates,
        parentTemplateFile,
      }
    }
  })

  if (notFound) {
    routes.childRoutes.push(notFound)
  }

  return routes
}
