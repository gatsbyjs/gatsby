import React from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"

import apiRunner from "./api-runner-browser"
// import rootRoute from "./child-routes"
import syncRequires from "./sync-requires"
import routes from "./routes.json"

console.log(syncRequires)
console.log(routes)

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

const $ = React.createElement

const Root = () =>
  $(
    Router,
    null,
    $(
      ScrollContext,
      { shouldUpdateScroll },
      $(Route, {
        component: location =>
          // TODO add support for multiple nested layouts
          // and for layouts to be able to have their own queries.
          $(syncRequires.layouts[`index`], { ...location }, [
            ...Object.keys(routes).map(path => {
              const route = routes[path]
              return $(Route, {
                exact: true,
                path,
                component: props =>
                  $(syncRequires.components[route.componentChunkName], {
                    ...props,
                    ...syncRequires.json[route.jsonName],
                  }),
              })
            }),
          ]),
      })
    )
  )

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default WrappedRoot
