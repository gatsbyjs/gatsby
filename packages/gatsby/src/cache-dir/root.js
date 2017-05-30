import React from "react"
import {
  BrowserRouter as Router,
  Route,
  matchPath,
  withRouter,
} from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"

import apiRunner from "./api-runner-browser"
import syncRequires from "./sync-requires"
import pages from "./pages.json"

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

const noMatch = pages.find(r => r.path === `/dev-404-page/`)

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

const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]
const DefaultRouter = ({ children }) => (
  <Router history={history}>{children}</Router>
)

// Use default layout if one isn't set.
let layout
if (syncRequires.layouts[`index`]) {
  layout = syncRequires.layouts[`index`]
} else {
  layout = ({ children }) => <div>{children()}</div>
}

const Root = () =>
  $(
    AltRouter ? AltRouter : DefaultRouter,
    null,
    $(
      ScrollContext,
      { shouldUpdateScroll },
      $(withRouter(layout), {
        children: layoutProps =>
          $(Route, {
            render: routeProps => {
              window.___history = routeProps.history
              const props = layoutProps ? layoutProps : routeProps
              const page = pages.find(page => {
                if (page.matchPath) {
                  // Try both the path and matchPath
                  return (
                    matchPath(props.location.pathname, { path: page.path }) ||
                    matchPath(props.location.pathname, {
                      path: page.matchPath,
                    })
                  )
                } else {
                  return matchPath(props.location.pathname, {
                    path: page.path,
                    exact: true,
                  })
                }
              })
              if (page) {
                return $(syncRequires.components[page.componentChunkName], {
                  ...props,
                  ...syncRequires.json[page.jsonName],
                })
              } else {
                return addNotFoundRoute()
              }
            },
          }),
      })
    )
  )

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default WrappedRoot
