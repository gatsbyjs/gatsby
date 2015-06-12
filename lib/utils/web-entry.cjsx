React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
createRoutes = require 'create-routes'
app = require 'app'

# TODO add extra file watcher here to reload config when file add/removed
loadConfig = (cb) ->
  stuff = require 'config'
  if module.hot
    module.hot.accept stuff.id, ->
      stuff = require 'config'
      cb stuff

  cb stuff

loadConfig (stuff) ->
  {pages, config, relativePath} = stuff

  app.loadContext (pagesReq) ->
    app = createRoutes(pages, pagesReq)
    {pages, config, relativePath} = require 'config'

    if router
      router.replaceRoutes [app]
    else
      router = Router.run [app], Router.HistoryLocation, (Handler, state) ->
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
