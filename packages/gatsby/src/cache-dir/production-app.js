import apiRunner from "./api-runner-browser"
// Let the site/plugins run code very early.
apiRunner(`onClientEntry`)

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

import pages from "./pages.json"
import ComponentRenderer from "./component-renderer"
import asyncRequires from "./async-requires"
import loader from "./loader"
loader.addPagesArray(pages)
loader.addProdRequires(asyncRequires)
window.asyncRequires = asyncRequires

window.___loader = loader

window.matchPath = matchPath

const navigateTo = pathname => {
  console.log(`navigateTo`, pathname)
  // Listen to loading events. If page resources load before
  // a second, navigate immediately.
  const eventHandler = e => {
    console.log(`onPostLoadPageResources in ___navigate`, e, pathname)
    if (e.page.path === pathname) {
      console.log("woot! page resources have arrived")
      clearTimeout(timeoutId)
      window.___history.push(pathname)
    }
  }

  // Start a timer to wait for a second before transitioning and showing a
  // loader in case resources aren't around yet.
  const timeoutId = setTimeout(() => {
    console.log("waited for resources but NOTHING, gosh slow")
    emitter.off(`onPostLoadPageResources`, eventHandler)
    window.___history.push(pathname)
  }, 1000)

  emitter.on(`onPostLoadPageResources`, eventHandler)
  if (loader.getResourcesForPathname(pathname)) {
    console.log("already have resources, navigating")
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
  console.log(asyncRequires.layouts)
  if (asyncRequires.layouts[`index`]) {
    console.log(asyncRequires.layouts)
    asyncRequires.layouts[`index`]((err, executeChunk) => {
      console.log("executeChunk", executeChunk)
      const module = executeChunk()
      console.log("module", module)
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
                // return renderPage(props)
                if (loader.hasPage(props.location.pathname)) {
                  return createElement(ComponentRenderer, { ...props })
                } else {
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
