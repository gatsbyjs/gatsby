import React from 'react'
import ReactDOM from 'react-dom'
import applyRouterMiddleware from 'react-router/lib/applyRouterMiddleware'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteUpdate } from 'gatsby-browser'
// Explicitly require from here. This isn't normally required but seems to be
// when developed using "npm link" as otherwise Webpack uses different versions
// of the plugin (one locally and the other in the checked out version of
// Gatsby) which makes everything fall apart.
const runtime = require(`gatsby/node_modules/offline-plugin/runtime`)
runtime.install({
  onInstalled () {
    console.log(`App is ready for offline usage`)
  },
})

const rootElement = document.getElementById(`react-mount`)
const rootRoute = require(`./split-child-routes`)
console.log(`rootRoute`, rootRoute)

let currentLocation

browserHistory.listen(location => {
  currentLocation = location
})

function onUpdate () {
  if (onRouteUpdate) {
    onRouteUpdate(currentLocation)
  }
}

function shouldUpdateScroll (prevRouterProps, { location: { pathname } }) {
  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
     return false
    }
  }
  return true
}

ReactDOM.render((
  <Router
    history={browserHistory}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
    onUpdate={onUpdate}
  />
), typeof window !== `undefined` ? document.getElementById(`react-mount`) : void 0)
