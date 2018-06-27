import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React, { createElement } from "react"
import ReactDOM from "react-dom"
import { Router, Route, withRouter, matchPath } from "react-router-dom"
import { ScrollContext } from "gatsby-react-router-scroll"
import domReady from "domready"
import { createLocation } from "history"
import history from "./history"
window.___history = history
import emitter from "./emitter"
window.___emitter = emitter
import redirects from "./redirects.json"
import PageRenderer from "./page-renderer"
import asyncRequires from "./async-requires"
import loader from "./loader"

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = loader

window.matchPath = matchPath

loader.addPagesArray([window.page])
loader.addDataPaths({ [window.page.jsonName]: window.dataPath })
loader.addProdRequires(asyncRequires)

// Convert to a map for faster lookup in maybeRedirect()
const redirectMap = redirects.reduce((map, redirect) => {
  map[redirect.fromPath] = redirect
  return map
}, {})

const maybeRedirect = pathname => {
  const redirect = redirectMap[pathname]

  if (redirect != null) {
    history.replace(redirect.toPath)
    return true
  } else {
    return false
  }
}

// Check for initial page-load redirect
maybeRedirect(window.location.pathname)

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Let plugins register a service worker. The plugin just needs
  // to return true.
  if (apiRunner(`registerServiceWorker`).length > 0) {
    require(`./register-service-worker`)
  }

  let lastNavigateToLocationString = null

  const navigate = (to, replace) => {
    const location = createLocation(to, null, null, history.location)
    let { pathname } = location
    const redirect = redirectMap[pathname]

    // If we're redirecting, just replace the passed in pathname
    // to the one we want to redirect to.
    if (redirect) {
      pathname = redirect.toPath
    }
    const wl = window.location

    // If we're already at this location, do nothing.
    if (
      wl.pathname === location.pathname &&
      wl.search === location.search &&
      wl.hash === location.hash
    ) {
      return
    }

    const historyNavigateFunc = replace
      ? window.___history.replace
      : window.___history.push

    const historyNavigateAction = replace
      ? `REPLACE`
      : `PUSH`

    // Start a timer to wait for a second before transitioning and showing a
    // loader in case resources aren't around yet.
    const timeoutId = setTimeout(() => {
      emitter.emit(`onDelayedLoadPageResources`, { pathname })
      apiRunner(`onRouteUpdateDelayed`, { location, action: historyNavigateAction })
    }, 1000)

    lastNavigateToLocationString = `${location.pathname}${location.search}${
      location.hash
    }`

    apiRunner(`onPreRouteUpdate`, { location, action: historyNavigateAction })

    const loaderCallback = pageResources => {
      if (!pageResources) {
        // We fetch resources for 404 page in page-renderer.js. Calling it
        // here is to ensure that we have needed resouces to render page 
        // before navigating to it
        loader.getResourcesForPathname(`/404.html`, loaderCallback)
      } else {
        clearTimeout(timeoutId)
        historyNavigateFunc(location)
      }
    }

    loader.getResourcesForPathname(pathname, loaderCallback)
  }

  // window.___loadScriptsForPath = loadScriptsForPath
  window.___push = to => navigate(to, false)
  window.___replace = to => navigate(to, true)

  // Call onRouteUpdate on the initial page load.
  apiRunner(`onRouteUpdate`, {
    location: history.location,
    action: history.action,
  })

  let initialAttachDone = false
  function attachToHistory(history) {
    if (!window.___history || initialAttachDone === false) {
      window.___history = history
      initialAttachDone = true

      history.listen((location, action) => {
        if (!maybeRedirect(location.pathname)) {
          // Check if we already ran onPreRouteUpdate API
          // in navigateTo function
          if (
            lastNavigateToLocationString !==
            `${location.pathname}${location.search}${location.hash}`
          ) {
            apiRunner(`onPreRouteUpdate`, { location, action })
          }
          // Make sure React has had a chance to flush to DOM first.
          setTimeout(() => {
            apiRunner(`onRouteUpdate`, { location, action })
          }, 0)
        }
      })
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
      const {
        location: { pathname: oldPathname },
      } = prevRouterProps
      if (oldPathname === pathname) {
        return false
      }
    }
    return true
  }

  const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]

  loader.getResourcesForPathname(window.location.pathname, () => {
    const Root = () =>
      createElement(
        AltRouter ? AltRouter : Router,
        {
          basename: __PATH_PREFIX__,
          history: !AltRouter ? history : undefined,
        },
        createElement(
          ScrollContext,
          { shouldUpdateScroll },
          createElement(withRouter(Route), {
            render: routeProps => {
              attachToHistory(routeProps.history)

              if (loader.getPage(routeProps.location.pathname)) {
                return createElement(PageRenderer, {
                  isPage: true,
                  ...routeProps,
                })
              } else {
                return createElement(PageRenderer, {
                  isPage: true,
                  location: { pathname: `/404.html` },
                })
              }
            },
          })
        )
      )

    const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]

    const renderer = apiRunner(
      `replaceHydrateFunction`,
      undefined,
      ReactDOM.hydrate
    )[0]

    domReady(() => {
      renderer(
        <NewRoot />,
        typeof window !== `undefined`
          ? document.getElementById(`___gatsby`)
          : void 0,
        () => {
          apiRunner(`onInitialClientRender`)
        }
      )
    })
  })
})
