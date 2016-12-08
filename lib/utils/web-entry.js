/* @flow weak */
import React from 'react'
import ReactDOM from 'react-dom'
import { applyRouterMiddleware, browserHistory, hashHistory, Router } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll'

import createRoutes from 'create-routes'
const loadContext = require('.gatsby-context')
import { onRouteChange, onRouteUpdate } from 'gatsby-browser'

function loadConfig (cb) {
  const stuff = require('config')
  if (module.hot) {
    module.hot.accept(stuff.id, () => cb())
  }
  return cb()
}

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

function shouldUpdateScroll (prevRouterProps, { location: { pathname } }) {
  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
      return false
    }
  }
  return true
}

let routes
loadConfig(() =>
  loadContext((pagesReq) => {
    const { pages, history } = require('config')
    if (!routes) {
      routes = createRoutes(pages, pagesReq)
    } else {
      createRoutes(pages, pagesReq)
    }

    let theHistory = browserHistory
    if (history && history === 'hashHistory') {
      theHistory = hashHistory
    }

    ReactDOM.render(
      <Router
        history={theHistory}
        routes={routes}
        render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
        onUpdate={onUpdate}
      />,
      typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
  })
)
