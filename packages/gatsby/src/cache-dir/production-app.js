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
import invariant from "invariant"

import pages from "./pages.json"
import findPage from "./find-page"

window.matchPath = matchPath

import requires from "./async-requires"

// Load scripts
const preferDefault = m => (m && m.default) || m
const scriptsCache = {}
const loadScriptsForPath = (path, cb = () => {}) => {
  const page = findPage(path)

  let scripts = {
    layout: false,
    component: false,
    pageData: false,
  }

  if (!page) {
    return cb(scripts)
  }

  if (scriptsCache[page.path]) {
    return cb(scriptsCache[page.path])
  }

  const loaded = () => {
    if (
      scripts.layout !== false &&
      scripts.component !== false &&
      scripts.pageData !== false
    ) {
      scriptsCache[page.path] = scripts
      cb(scripts)
    }
  }

  // Load layout file.
  if (requires.layouts.index) {
    requires.layouts.index(layout => {
      scripts.layout = preferDefault(layout)
      loaded()
    })
  } else {
    scripts.layout = ``
    loaded()
  }

  requires.components[page.componentChunkName](component => {
    scripts.component = preferDefault(component)
    loaded()
  })

  requires.json[page.jsonName](pageData => {
    scripts.pageData = pageData
    loaded()
  })
}

const navigateTo = pathname => {
  loadScriptsForPath(pathname, () => {
    window.___history.push(pathname)
  })
}

window.___loadScriptsForPath = loadScriptsForPath
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

// Load 404 page component and scripts
let notFoundScripts
loadScriptsForPath(`/404.html`, scripts => {
  notFoundScripts = scripts
})

const renderPage = props => {
  const page = findPage(props.location.pathname)
  if (page) {
    const pageCache = scriptsCache[page.path]

    invariant(
      pageCache,
      `Page cache miss at ${props.location
        .pathname} for key ${page.path}. Available keys: ${Object.keys(
        scriptsCache
      )}`
    )

    return createElement(pageCache.component, {
      ...props,
      ...pageCache.pageData,
    })
  } else if (notFoundScripts) {
    return createElement(notFoundScripts.component, {
      ...props,
      ...notFoundScripts.pageData,
    })
  } else {
    return null
  }
}

// TODO component renderer — new file
// set as props pages + loader

const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]
const DefaultRouter = ({ children }) =>
  <Router history={history}>{children}</Router>

loadScriptsForPath(window.location.pathname, scripts => {
  // Use default layout if one isn't set.
  let layout
  if (scripts.layout) {
    layout = scripts.layout
  } else {
    layout = props => <div>{props.children()}</div>
  }

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
                return renderPage(props)
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
