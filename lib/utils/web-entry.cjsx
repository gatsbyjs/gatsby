React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
createRoutes = require 'create-routes'
app = require 'app'
{pages, config, relativePath} = require 'config'

pagesReq = app.context()
app = createRoutes(pages, pagesReq)

Router.run [app], Router.HistoryLocation, (Handler, state) ->
  page = find pages, (page) -> page.path is state.pathname
  React.render(<Handler config={config} pages={pages} page={page} state={state}/>, document?.getElementById("react-mount"))
