import React, { createElement } from "react"
import { Router, Route, withRouter } from "react-router-dom"
import { ScrollContext } from "gatsby-react-router-scroll"
import history from "./history"
import { apiRunner } from "./api-runner-browser"
import syncRequires from "./sync-requires"
import pages from "./pages.json"
import redirects from "./redirects.json"
import PageRenderer from "./page-renderer"
import loader from "./loader"
import { hot } from "react-hot-loader"
import JSONStore from "./json-store"

import * as ErrorOverlay from "react-error-overlay"

// Report runtime errors
ErrorOverlay.startReportingRuntimeErrors({
  onError: () => {},
  filename: `/commons.js`,
})
ErrorOverlay.setEditorHandler(errorLocation =>
  window.fetch(
    `/__open-stack-frame-in-editor?fileName=` +
      window.encodeURIComponent(errorLocation.fileName) +
      `&lineNumber=` +
      window.encodeURIComponent(errorLocation.lineNumber || 1)
  )
)

if (window.__webpack_hot_middleware_reporter__ !== undefined) {
  // Report build errors
  window.__webpack_hot_middleware_reporter__.useCustomOverlay({
    showProblems(type, obj) {
      if (type !== `errors`) {
        ErrorOverlay.dismissBuildError()
        return
      }
      ErrorOverlay.reportBuildError(obj[0])
    },
    clear() {
      ErrorOverlay.dismissBuildError()
    },
  })
}

loader.addPagesArray(pages)
loader.addDevRequires(syncRequires)
window.___loader = loader

// Convert to a map for faster lookup in maybeRedirect()
const redirectMap = redirects.reduce((map, redirect) => {
  map[redirect.fromPath] = redirect
  return map
}, {})

// Check for initial page-load redirect
maybeRedirect(location.pathname)

// Call onRouteUpdate on the initial page load.
apiRunner(`onRouteUpdate`, {
  location: history.location,
  action: history.action,
})

function attachToHistory(history) {
  if (!window.___history) {
    window.___history = history

    history.listen((location, action) => {
      if (!maybeRedirect(location.pathname)) {
        apiRunner(`onRouteUpdate`, { location, action })
      }
    })
  }
}

function maybeRedirect(pathname) {
  const redirect = redirectMap[pathname]

  if (redirect != null) {
    const pageResources = loader.getResourcesForPathname(pathname)

    if (pageResources != null) {
      console.error(
        `The route "${pathname}" matches both a page and a redirect; this is probably not intentional.`
      )
    }

    history.replace(redirect.toPath)
    return true
  } else {
    return false
  }
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

const navigateTo = to => {
  window.___history.push(to)
}

window.___navigateTo = navigateTo

let pathPrefix = `/`
if (__PREFIX_PATHS__) {
  pathPrefix = `${__PATH_PREFIX__}/`
}

const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]

const Root = () =>
  createElement(
    AltRouter ? AltRouter : Router,
    {
      basename: pathPrefix.slice(0, -1),
      history: !AltRouter ? history : undefined,
    },
    createElement(
      ScrollContext,
      { shouldUpdateScroll },
      createElement(Route, {
        // eslint-disable-next-line react/display-name
        render: routeProps => {
          attachToHistory(routeProps.history)
          const { pathname } = routeProps.location
          const pageResources = loader.getResourcesForPathname(pathname)
          const isPage = !!(pageResources && pageResources.component)
          if (isPage) {
            return createElement(JSONStore, {
              pages,
              ...routeProps,
              pageResources,
            })
          } else {
            const dev404Page = pages.find(p => /^\/dev-404-page/.test(p.path))
            return createElement(Route, {
              key: `404-page`,
              component: props =>
                createElement(
                  syncRequires.components[dev404Page.componentChunkName],
                  {
                    ...propsWithoutPages,
                    ...data,
                  }
                ),
            })
          }
        },
      })
    )
  )

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

export default hot(module)(WrappedRoot)
