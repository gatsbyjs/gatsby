React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
filter = require 'lodash/collection/filter'
createRoutes = require 'create-routes'
app = require 'app'

loadConfig = (cb) ->
  stuff = require 'config'
  if module.hot
    module.hot.accept stuff.id, ->
      cb()

  cb()

loadConfig ->
  app.loadContext (pagesReq) ->
    {pages, config, relativePath} = require 'config'

    routes = createRoutes(pages, pagesReq)

    # Remove templates files.
    pages = filter(pages, (page) -> page.path?)

    # Route already exists meaning we're hot-reloading.
    if router
      router.replaceRoutes [app]
    else
      router = Router.run [routes], Router.HistoryLocation, (Handler, state) ->
        # Pull out direct children of the template for this path.
        childrenPaths = state.routes[state.routes.length - 2].childRoutes.map (route) -> route.path
        if childrenPaths
          children = filter pages, (page) -> page.path in childrenPaths
        else
          children = []

        page = find pages, (page) -> page.path is state.pathname

        # Let app know the route is changing.
        if app.onRouteChange then app.onRouteChange(state, page, pages, config)

        React.render(
          <Handler
            config={config}
            pages={pages}
            page={page}
            children={children}
            state={state}
          />,
          document?.getElementById("react-mount")
        )
