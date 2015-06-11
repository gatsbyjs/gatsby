Router = require 'react-router'

module.exports = (pages, pagesReq) ->

  app = Router.createDefaultRoute({
    name: 'app'
    path: '/'
    handler: pagesReq './app'
  })

  ## Render first every template + possible other parentRoutes
  ##
  ## for handler, need to figure out right handler. CJSXs are standalone
  ## but for markdown, need a component which wraps markdown.
  ##
  ## temp index should just render "APP"

  markdownWrapper = require 'wrappers/md'
  htmlWrapper = require 'wrappers/html'

  for page in pages
    switch page.ext
      when "md"
        handler = markdownWrapper
        page.data = pagesReq "./" + page.requirePath
      when "html"
        handler = htmlWrapper
      else
        handler = pagesReq "./" + page.requirePath

    # Index page, create a default route
    if page.path.indexOf('/index') > -1
      Router.createDefaultRoute({
        name: page.path
        path: page.path
        parentRoute: app
        handler: handler
      })
    else
      Router.createRoute({
        name: page.path
        path: page.path
        parentRoute: app
        handler: handler
      })

  return app

