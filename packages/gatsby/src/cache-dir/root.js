import React, { createElement } from "react"
import {
  BrowserRouter as Router,
  Route,
  matchPath,
  withRouter,
} from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"
import mitt from "mitt"

window.___emitter = mitt()

import apiRunner from "./api-runner-browser"
import syncRequires from "./sync-requires"
import pages from "./pages.json"
import ComponentRenderer from "./component-renderer"
import loader from "./loader"
loader.addPagesArray(pages)
loader.addDevRequires(syncRequires)

console.log(loader)
window.___loader = loader

const history = createHistory()

function attachToHistory(history) {
  window.___history = history

  history.listen((location, action) => {
    apiRunner(`onRouteUpdate`, { location, action })
  })
}

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

const noMatch = pages.find(r => r.path === `/dev-404-page/`)

const addNotFoundRoute = () => {
  if (noMatch) {
    return createElement(Route, {
      key: `404-page`,
      component: props =>
        createElement(syncRequires.components[noMatch.componentChunkName], {
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
const DefaultRouter = ({ children }) =>
  <Router history={history}>{children}</Router>

// Use default layout if one isn't set.
let layout
if (syncRequires.layouts[`index`]) {
  layout = syncRequires.layouts[`index`]
} else {
  layout = ({ children }) => <div>{children()}</div>
}

// Always have to have one top-level layout
// can have ones below that. Find page, if has different
// parent layout(s), loop through those until finally the
// page. Tricky part is avoiding re-mounting I think...

const Root = () =>
  createElement(
    AltRouter ? AltRouter : DefaultRouter,
    null,
    createElement(
      ScrollContext,
      { shouldUpdateScroll },
      createElement(withRouter(layout), {
        children: layoutProps =>
          createElement(Route, {
            render: routeProps => {
              attachToHistory(routeProps.history)

              const props = layoutProps ? layoutProps : routeProps
              const pageResources = loader.getResourcesForPathname(
                props.location.pathname
              )
              if (pageResources) {
                return createElement(ComponentRenderer, { ...props })
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
