import React from 'react'
import { applyRouterMiddleware, Router, browserHistory } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteUpdate } from 'gatsby-browser'

const rootRoute = require(`./child-routes`)

let currentLocation

browserHistory.listen(location => {
  currentLocation = location
})

function shouldUpdateScroll (prevRouterProps, { location: { pathname } }) {
  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
     return false
    }
  }
  return true
}

const Root = () => (
  <Router
    history={browserHistory}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
    onUpdate={() => {if (onRouteUpdate) { onRouteUpdate(currentLocation) }}}
  />
)

export default Root
