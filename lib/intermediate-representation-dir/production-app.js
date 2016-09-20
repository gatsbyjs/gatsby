import React from 'react'
import ReactDOM from 'react-dom'
import applyRouterMiddleware from 'react-router/lib/applyRouterMiddleware'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteChange, onRouteUpdate } from 'gatsby-browser'
const runtime = require(`gatsby/node_modules/offline-plugin/runtime`)
runtime.install({
  onInstalled () {
    console.log(`App is ready for offline usage`)
  },
})

const rootElement = document.getElementById(`react-mount`)
const rootRoute = require(`./split-child-routes`)
console.log(`rootRoute`, rootRoute)

const currentLocation = null

function onUpdate () {
  if (onRouteUpdate) {
    onRouteUpdate(currentLocation)
  }
}

ReactDOM.render((
  <Router
    history={browserHistory}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll())}
    onUpdate={onUpdate}
  />
), typeof window !== `undefined` ? document.getElementById(`react-mount`) : void 0)
