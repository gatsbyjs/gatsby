import React from "react"
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter,
} from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"

import apiRunner from "./api-runner-browser"
// import rootRoute from "./child-routes"
import syncRequires from "./sync-requires"
import routes from "./routes.json"
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

const filteredRoutes = routes.filter(r => r.path !== `/404.html`)
const noMatch = routes.find(r => r.path === `/404.html`)

const addNotFoundRoute = () => {
  if (noMatch) {
    return $(Route, {
      key: `404-page`,
      component: props =>
        $(syncRequires.components[noMatch.componentChunkName], {
          ...props,
          ...syncRequires.json[noMatch.jsonName],
        }),
    })
  } else {
    return null
  }
}

const navigateTo = pathname => {
  window.___history.push(pathname)
}

window.___navigateTo = navigateTo

const Root = () =>
  $(
    Router,
    null,
    $(
      ScrollContext,
      { shouldUpdateScroll },
      $(withRouter(syncRequires.layouts[`index`]), {
        children: layoutProps => {
          return $(Route, {
            component: routeProps => {
              window.___history = routeProps.history
              const props = layoutProps ? layoutProps : routeProps
              const page = routes.find(
                route => route.path === props.location.pathname
              )
              if (page) {
                return $(syncRequires.components[page.componentChunkName], {
                  ...props,
                  ...syncRequires.json[page.jsonName],
                })
              } else {
                return addNotFoundRoute()
              }
            },
          })
        },
      })
    )
  )

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default WrappedRoot
