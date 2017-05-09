import React from "react"
import useScroll from "react-router-scroll/lib/useScroll"
import { BrowserRouter as Router, Route } from "react-router-dom"
import createHistory from "history/createBrowserHistory"

import apiRunner from "./api-runner-browser"
// import rootRoute from "./child-routes"
import syncRequires from "./sync-requires"
import routes from "./routes.json"

console.log(syncRequires)
console.log(routes)

let currentLocation

const history = createHistory()
history.listen((location, action) => {
  console.log("action", action)
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

const DefaultLayout = () => {
  return React.createElement(syncRequires.layouts["index"])
}

// TODO assemble component hierarchy on the fly. wrapper > ...layouts w/ data > page w/ data

const Root = () =>
  React.createElement(
    Router,
    null,
    React.createElement(Route, {
      component: location =>
        React.createElement(syncRequires.layouts["index"], { ...location }, [
          ...Object.keys(routes).map(path => {
            const route = routes[path]
            return React.createElement(Route, {
              exact: true,
              path,
              component: props =>
                React.createElement(
                  syncRequires.components[route.componentChunkName],
                  {
                    ...props,
                    ...syncRequires.json[route.jsonName],
                  }
                ),
            })
          }),
        ]),
    })
  )
// history={browserHistory}
// routes={rootRoute}
// render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
// onUpdate={() => {
// }}
// />

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default WrappedRoot
