import apiRunner from "./api-runner-browser"
// Let the site/plugins run code very early.
apiRunner(`clientEntry`)

import React from "react"
import ReactDOM from "react-dom"
import applyRouterMiddleware from "react-router/lib/applyRouterMiddleware"
import Router from "react-router/lib/Router"
import match from "react-router/lib/match"
import browserHistory from "react-router/lib/browserHistory"
import useScroll from "react-router-scroll/lib/useScroll"

const rootElement = document.getElementById(`react-mount`)
const rootRoute = require(`./split-child-routes`)

// If you try to load the split-child-routes module in other
// modules, Webpack freezes in some sort of infinite loop when
// you try to build the javascript for production. No idea
// why... so for now we'll pop the routes on window. I hope no
// one feels overly dirty from reading this ;-)
if (typeof window !== `undefined`) {
  window.gatsbyRootRoute = rootRoute
}

let currentLocation
browserHistory.listen(location => {
  currentLocation = location
})

function shouldUpdateScroll (prevRouterProps, { location: { pathname } }) {
  const results = apiRunner(`shouldUpdateScroll`, {
    prevRouterProps,
    pathname,
  })
  if (results.length > 0) {
    return results[0]
  }

  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
      return false
    }
  }
  return true
}

match({ history: browserHistory, routes: rootRoute }, (
  error,
  redirectLocation,
  renderProps,
) => {
  const Root = () => (
    <Router
      {...renderProps}
      render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
      onUpdate={() => {
        apiRunner(`onRouteUpdate`, currentLocation)
      }}
    />
  )
  const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]
  ReactDOM.render(
    <NewRoot />,
    typeof window !== `undefined`
      ? document.getElementById(`react-mount`)
      : void 0,
  )
})
