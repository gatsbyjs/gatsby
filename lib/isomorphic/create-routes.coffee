Router = require 'react-router'
filter = require 'lodash/collection/filter'
sortBy = require 'lodash/collection/sortBy'
last = require 'lodash/array/last'
includes = require 'underscore.string/include'
{ config } = require 'config'

module.exports = (pages, pagesReq) ->
  templates = {}
  templates.root = Router.createRoute({
    name: 'root-template'
    path: "/"
    handler: pagesReq './_template'
  })

  # Adds a handler for <NotFoundRoute /> that will serve as a 404 Page
  if config.notFound
    templates.rootNotFound = Router.createNotFoundRoute({
      name: 'root-not-found'
      path: "*"
      handler: pagesReq './_404'
      parentRoute: templates.root
    })

  # Adds a handler for <Route path="page/*" />  for pagination
  if config.pagination
    templates.rootPagination = Router.createRoute({
      name: "root-pagination"
      path: "page/:pageId"
      parentRoute: templates.root
      handler: pagesReq './_pagination'
    })

  # Adds a handler for <Route path="tag/*" />  for pages tagging
  if config.tags
    templates.rootTags = Router.createRoute({
      name: "root-tags"
      path: "tag/:tagId"
      parentRoute: templates.root
      handler: pagesReq './_tag'
    })

  # Arrange pages in data structure according to their position
  # on the file system. Then use this to create routes.
  #
  # Algorithm
  # 1. Find all templates.
  # 2. Create routes for each template russian-doll style.
  # 3. For each index file paired with a template, create a default route
  # 4. Create normal routes for each remaining file under the appropriate
  # template
  templateFiles = filter pages, (page) ->
    page.file.name is "_template" and
      page.file.dirname isnt "."

  for templateFile in templateFiles
    # Find the parent template of this template.
    parentTemplates = filter(templateFiles, (template) ->
      includes(templateFile.requirePath, template.file.dirname)
    )
    parentTemplates = sortBy(parentTemplates, (template) ->
      template?.file.dirname.length)
    parentTemplateFile = last(parentTemplates)
    parentRoute = templates[parentTemplateFile?.file.dirname]

    unless parentRoute
      parentRoute = templates.root

    templates[templateFile.file.dirname] = Router.createRoute({
      name: templateFile.file.dirname + "-template"
      path: templateFile.templatePath
      parentRoute: parentRoute
      handler: pagesReq "./" + templateFile.requirePath
    })

    # Adds a handler for <Route path="page/*" /> (for each templateFile) for pagination
    if config.pagination
      templates[templateFile.file.dirname + "-pagination"] = Router.createRoute({
        name: templateFile.file.dirname + "-pagination"
        path: templateFile.templatePath + "page/:pageId"
        parentRoute: templates[templateFile.file.dirname]
        handler: pagesReq "./" + templateFile.file.dirname + "/_pagination"
      })

  # Remove files that start with an underscore as this indicates
  # the file shouldn't be turned into a page.
  filteredPages = filter pages, (page) -> page.file.name.slice(0,1) isnt '_'

  markdownWrapper = require 'wrappers/md'
  htmlWrapper = require 'wrappers/html'

  for page in filteredPages
    # TODO add ways to load data for other file types.
    # Should be able to install a gatsby-toml plugin to add support
    # for TOML. Perhaps everything other than JSX and Markdown should be plugins.
    # Or even they are plugins but they have built-in "blessed" plugins.
    switch page.file.ext
      when "md"
        handler = markdownWrapper
        page.data = pagesReq "./" + page.requirePath
      when "html"
        handler = htmlWrapper
      when "jsx"
        handler = pagesReq "./" + page.requirePath
        page.data = if pagesReq("./" + page.requirePath).metadata
          pagesReq("./" + page.requirePath).metadata()
      when "cjsx"
        handler = pagesReq "./" + page.requirePath
        page.data = if pagesReq("./" + page.requirePath).metadata
          pagesReq("./" + page.requirePath).metadata()
      else
        handler = pagesReq "./" + page.requirePath

    # Determine parent template for page.
    parentRoutes = filter(templateFiles, (templateFile) ->
      includes(page.requirePath, templateFile.file.dirname)
    )
    parentRoutes = sortBy(parentRoutes, (route) -> route?.file.dirname.length)
    parentTemplateFile = last(parentRoutes)
    parentRoute = templates[parentTemplateFile?.file.dirname]

    unless parentRoute
      parentRoute = templates.root

    if page.data and page.data.redirect
      # Adds a handler for <Redirect from="some/where" to="somewhere/else" /> where page has a `redirect` metadata
      Router.createRedirect({
        name: page.path
        from: page.path
        to: page.data.redirect
        parentRoute: parentRoute
      })
    # If page is an index page *and* in the same directory as a template,
    # it is the default route (for that template).
    else if includes(page.path, "/index") and
        parentRoute.file.dirname is parentTemplateFile.file.dirname
      Router.createDefaultRoute({
        name: page.path
        parentRoute: parentRoute
        handler: handler
      })
    else
      Router.createRoute({
        name: page.path
        path: page.path
        parentRoute: parentRoute
        handler: handler
      })

  return templates.root
