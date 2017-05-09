import apiRunner from "./api-runner-browser"
// Let the site/plugins run code very early.
apiRunner(`clientEntry`)

import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"

const requires = require(`./async-requires`)

const history = createHistory()
history.listen((location, action) => {
  apiRunner(`onRouteUpdate`, location, action)
})

function shouldUpdateScroll(prevRouterProps, { location: { pathname } }) {
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

// Match, ensure all necessary bundles are loaded, then runder.
// match(
// { history: browserHistory, routes: rootRoute },
// (error, redirectLocation, renderProps) => {
// const Root = () => (
// <Router
// {...renderProps}
// render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
// onUpdate={() => {
// apiRunner(`onRouteUpdate`, currentLocation)
// }}
// />
// )
// const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]
// ReactDOM.render(
// <NewRoot />,
// typeof window !== `undefined`
// ? document.getElementById(`___gatsby`)
// : void 0
// )
// }
// )
