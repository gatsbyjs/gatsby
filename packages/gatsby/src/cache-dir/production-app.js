import apiRunner from "./api-runner-browser"

import React, { createElement } from "react"
import ReactDOM from "react-dom"
import {
  BrowserRouter as Router,
  Route,
  withRouter,
  matchPath,
} from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"
// import invariant from "invariant"
import emitter from "./emitter"
window.___emitter = emitter

import pages from "./pages.json"
import ComponentRenderer from "./component-renderer"
import asyncRequires from "./async-requires"
import loader from "./loader"
loader.addPagesArray(pages)
loader.addProdRequires(asyncRequires)
window.asyncRequires = asyncRequires

window.___loader = loader

window.matchPath = matchPath

// Let the site/plugins run code very early.
apiRunner(`onClientEntry`)

const navigateTo = pathname => {
  // Listen to loading events. If page resources load before
  // a second, navigate immediately.
  function eventHandler(e) {
    if (e.page.path === pathname) {
      emitter.off(`onPostLoadPageResources`, eventHandler)
      clearTimeout(timeoutId)
      window.___history.push(pathname)
    }
  }

  // Start a timer to wait for a second before transitioning and showing a
  // loader in case resources aren't around yet.
  const timeoutId = setTimeout(() => {
    emitter.off(`onPostLoadPageResources`, eventHandler)
    emitter.emit(`onDelayedLoadPageResources`, { pathname })
    window.___history.push(pathname)
  }, 1000)

  emitter.on(`onPostLoadPageResources`, eventHandler)
  if (loader.getResourcesForPathname(pathname)) {
    emitter.off(`onPostLoadPageResources`, eventHandler)
    clearTimeout(timeoutId)
    window.___history.push(pathname)
  }
}

// window.___loadScriptsForPath = loadScriptsForPath
window.___navigateTo = navigateTo

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

const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]
const DefaultRouter = ({ children }) =>
  <Router history={history}>{children}</Router>

const loadLayout = cb => {
  if (asyncRequires.layouts[`index`]) {
    asyncRequires.layouts[`index`]((err, executeChunk) => {
      const module = executeChunk()
      cb(module)
    })
  } else {
    cb(props => <div>{props.children()}</div>)
  }
}

loadLayout(layout => {
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
                if (loader.hasPage(props.location.pathname)) {
                  return createElement(ComponentRenderer, { ...props })
                } else {
                  // TODO check (somehow) if we loaded the page
                  // from a service worker (app shell) as if this
                  // is the case and we get a 404 we want to kill
                  // the sw and reload as probably the user is
                  // trying to visit a page that was created after
                  // the first time they visited.
                  return createElement(ComponentRenderer, {
                    location: { pathname: `/404.html` },
                  })
                }
              },
            }),
        })
      )
    )

  const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]
  ReactDOM.render(
    <NewRoot />,
    typeof window !== `undefined`
      ? document.getElementById(`___gatsby`)
      : void 0
  )
})
