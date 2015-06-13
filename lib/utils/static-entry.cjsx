React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
createRoutes = require 'create-routes'
HTML = require 'html'
app = require 'app'
{pages, config} = require 'config'

routes = {}
app.loadContext (pagesReq) ->
  routes = createRoutes(pages, pagesReq)

module.exports = (locals, callback) ->
  Router.run [routes], locals.path, (Handler, state) ->
    page = find pages, (page) -> page.path is state.pathname
    body = React.renderToString(<Handler config={config} pages={pages} page={page} state={state}/>)
    html = React.renderToStaticMarkup(<HTML body={body}/>)
    callback null, html
