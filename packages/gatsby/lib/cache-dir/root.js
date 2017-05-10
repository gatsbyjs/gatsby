import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"

import apiRunner from "./api-runner-browser"
// import rootRoute from "./child-routes"
import syncRequires from "./sync-requires"
import routes from "./routes.json"

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

const filteredRoutes = routes.filter(r => r.path !== `/404.html`)
const noMatch = routes.find(r => r.path === `/404.html`)

const Root = () =>
  $(
    Router,
    null,
    $(
      ScrollContext,
      { shouldUpdateScroll },
      $(Route, {
        component: props => {
          window.__history = props.history
          // TODO add support for multiple nested layouts
          // and for layouts to be able to have their own queries.
          return $(
            syncRequires.layouts[`index`],
            { ...props },
            $(Switch, null, [
              ...filteredRoutes.map(route => {
                return $(Route, {
                  exact: true,
                  path: route.path,
                  component: props =>
                    $(syncRequires.components[route.componentChunkName], {
                      ...props,
                      ...syncRequires.json[route.jsonName],
                    }),
                })
              }),
              $(Route, {
                component: props =>
                  $(syncRequires.components[noMatch.componentChunkName], {
                    ...props,
                    ...syncRequires.json[noMatch.jsonName],
                  }),
              }),
            ])
          )
        },
      })
    )
  )

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default WrappedRoot
