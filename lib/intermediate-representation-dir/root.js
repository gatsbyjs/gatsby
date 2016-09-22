import React from 'react'
import { applyRouterMiddleware, Router, browserHistory } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteUpdate } from 'gatsby-browser'

const rootRoute = require(`./child-routes`)

let currentLocation

browserHistory.listen(location => {
  currentLocation = location
})

const Root = () => (
  <Router
    history={browserHistory}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll())}
    onUpdate={() => {if (onRouteUpdate) { onRouteUpdate(currentLocation) }}}
  />
)

export default Root
