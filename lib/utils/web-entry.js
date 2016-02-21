import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory, Router } from 'react-router'
import createRoutes from 'create-routes'
import app from 'app'

function loadConfig (cb) {
  const stuff = require('config')
  if (module.hot) {
    module.hot.accept(stuff.id, () => cb())
  }
  return cb()
}

browserHistory.listen(location => {
  if (app.onRouteChange) {
    app.onRouteChange(location)
  }
})

let routes
loadConfig(() =>
  app.loadContext((pagesReq) => {
    const { pages } = require('config')
    if (!routes) {
      routes = createRoutes(pages, pagesReq)
    } else {
      createRoutes(pages, pagesReq)
    }

    ReactDOM.render(
      <Router
        history={browserHistory}
        routes={routes}
      />,
      typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
  })
)
