import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory, Router } from 'react-router'
import useScroll from 'scroll-behavior/lib/useStandardScroll'
const scrollHistory = useScroll(() => browserHistory)()

import createRoutes from 'create-routes'
const loadContext = require('.gatsby-context')
import { onRouteChange } from 'gatsby-client-utils'

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
        history={scrollHistory}
        routes={routes}
      />,
      typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
  })
)
