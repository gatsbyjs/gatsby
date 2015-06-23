Router = require 'react-router'
filter = require 'lodash/collection/filter'

module.exports = (pages, pagesReq) ->
  templates = {}
  templates.root = Router.createRoute({
    name: 'root-template'
    path: "/"
    handler: pagesReq './_template'
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
    parentRoute = templates.root
    templates[templateFile.file.dirname] = Router.createRoute({
      name: templateFile.file.dirname + "-template"
      path: templateFile.path
      handler: pagesReq "./" + templateFile.requirePath
    })

  # Remove files that start with an underscore as this indicates
  # the file shouldn't be turned into a page.
  filteredPages = filter pages, (page) -> page.file.name.slice(0,1) isnt '_'

  markdownWrapper = require 'wrappers/md'
  htmlWrapper = require 'wrappers/html'

  for page in filteredPages
    switch page.file.ext
      when "md"
        handler = markdownWrapper
        page.data = pagesReq "./" + page.requirePath
      when "html"
        handler = htmlWrapper
      else
        handler = pagesReq "./" + page.requirePath

    # Determine parent route.
    # TODO
    root = templates.root

    # If page is an index page *and* in the same directory as a template,
    # create it as the default route.
    #if page.path.indexOf('/index') > -1 #TODO
    if page.requirePath is "index.cjsx"
      Router.createDefaultRoute({
        name: page.path
        parentRoute: root
        handler: handler
      })
    else
      Router.createRoute({
        name: page.path
        path: page.path
        parentRoute: root
        handler: handler
      })

  return root
