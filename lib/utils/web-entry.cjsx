React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
createRoutes = require 'create-routes'
app = require 'app'

# TODO add extra file watcher here to reload config when file add/removed
# TODO check if this is called when a new file is added. Narrow down problems
loadConfig = (cb) ->
  stuff = require 'config'
  if module.hot
    module.hot.accept stuff.id, ->
      cb()

  cb()

loadConfig ->
  app.loadContext (pagesReq) ->
    stuff = require 'config'
    {pages, config, relativePath} = stuff

    routes = createRoutes(pages, pagesReq)
    {pages, config, relativePath} = require 'config'

    if router
      router.replaceRoutes [app]
    else
      router = Router.run [routes], Router.HistoryLocation, (Handler, state) ->
        page = find pages, (page) -> page.path is state.pathname
        React.render(
          <Handler
            config={config}
            pages={pages}
            page={page}
            state={state}
          />,
          document?.getElementById("react-mount")
        )
