import React from 'react'
import ReactDOM from 'react-dom'
import { applyRouterMiddleware, browserHistory, Router } from 'react-router'
import useScroll from 'react-router-scroll'

import createRoutes from 'create-routes'
const loadContext = require('.gatsby-context')
import { onRouteChange } from 'gatsby-browser'

function loadConfig (cb) {
  const stuff = require('config')
  if (module.hot) {
    module.hot.accept(stuff.id, () => cb())
  }
  return cb()
}

browserHistory.listen(location => {
  if (onRouteChange) {
    onRouteChange(location)
  }
})

let routes
loadConfig(() =>
  loadContext((pagesReq) => {
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
        render={applyRouterMiddleware(useScroll())}
      />,
      typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
  })
)
