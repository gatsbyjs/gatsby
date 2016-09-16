import React from 'react'
import ReactDOM from 'react-dom'
import applyRouterMiddleware from 'react-router/lib/applyRouterMiddleware'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteChange, onRouteUpdate } from 'gatsby-browser'
const runtime = require('gatsby/node_modules/offline-plugin/runtime')
runtime.install({
  onInstalled () {
    console.log('App is ready for offline usage')
  }
})

const rootElement = document.getElementById('react-mount')
const rootRoute = require('./split-child-routes')

let currentLocation = null

browserHistory.listen(location => {
  currentLocation = location
  if (onRouteChange) {
    console.warn('onRouteChange is now deprecated and will be removed in the next major Gatsby release (0.13). Please use onRouteUpdate instead. See the PR for more info (https://github.com/gatsbyjs/gatsby/pull/321).')
    onRouteChange(location)
  }
})

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
), typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
