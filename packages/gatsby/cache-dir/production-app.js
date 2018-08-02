import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React, { createElement } from "react"
import ReactDOM from "react-dom"
import { Router, navigate as reachNavigate } from "@reach/router"
import { globalHistory } from "@reach/router/lib/history"
import { ScrollContext } from "gatsby-react-router-scroll"
import domReady from "domready"
import emitter from "./emitter"
window.___emitter = emitter
import redirects from "./redirects.json"
import PageRenderer from "./page-renderer"
import asyncRequires from "./async-requires"
import loader, { setApiRunnerForLoader } from "./loader"
import parsePath from "./parse-path"

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = loader

setApiRunnerForLoader(apiRunner)
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
    window.history.replace(redirect.toPath)
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
    const { pathname } = parsePath(to)
    const redirect = redirectMap[pathname]

    // If we're redirecting, just replace the passed in pathname
    // to the one we want to redirect to.
    if (redirect) {
      pathname = redirect.toPath
    }

    // If we had a service worker update, no matter the path, reload window
    if (window.GATSBY_SW_UPDATED) {
      window.location = pathname
    }

    const wl = window.location

    const historyNavigateAction = replace ? `REPLACE` : `PUSH`

    // Start a timer to wait for a second before transitioning and showing a
    // loader in case resources aren't around yet.
    const timeoutId = setTimeout(() => {
      emitter.emit(`onDelayedLoadPageResources`, { pathname })
      apiRunner(`onRouteUpdateDelayed`, {
        location,
        action: historyNavigateAction,
      })
    }, 1000)

    lastNavigateToLocationString = to

    apiRunner(`onPreRouteUpdate`, { location, action: historyNavigateAction })

    const loaderCallback = pageResources => {
      if (!pageResources) {
        // We fetch resources for 404 page in page-renderer.js. Calling it
        // here is to ensure that we have needed resouces to render page
        // before navigating to it
        loader.getResourcesForPathname(`/404.html`, loaderCallback)
      } else {
        clearTimeout(timeoutId)
        reachNavigate(location.pathname, { replace })
      }
    }

    loader.getResourcesForPathname(pathname, loaderCallback)
  }

  // window.___loadScriptsForPath = loadScriptsForPath
  window.___push = to => navigate(to, false)
  window.___replace = to => navigate(to, true)

  // Call onRouteUpdate on the initial page load.
  apiRunner(`onRouteUpdate`, {
    location: window.history.location,
  })

  globalHistory.listen(() => {
    const location = globalHistory.location
    if (!maybeRedirect(location.pathname)) {
      // Check if we already ran onPreRouteUpdate API
      // in navigateTo function
      if (
        lastNavigateToLocationString !==
        `${location.pathname}${location.search}${location.hash}`
      ) {
        apiRunner(`onPreRouteUpdate`, { location })
      }
      // Make sure React has had a chance to flush to DOM first.
      setTimeout(() => {
        apiRunner(`onRouteUpdate`, { location })
      }, 0)
    }
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
      const {
        location: { pathname: oldPathname },
      } = prevRouterProps
      if (oldPathname === pathname) {
        return false
      }
    }
    return true
  }

  class RouteHandler extends React.Component {
    render() {
      const { location } = this.props
      let child

      // TODO
      // check if hash + if element and if so scroll
      // remove hash handling from gatsby-link
      // check if scrollbehavior handles back button for
      // restoring old position
      // if not, add that.

      if (loader.getPage(location.pathname)) {
        child = createElement(PageRenderer, {
          isPage: true,
          ...this.props,
        })
      } else {
        child = createElement(PageRenderer, {
          isPage: true,
          location: { pathname: `/404.html` },
        })
      }

      return (
        <ScrollContext
          location={location}
          shouldUpdateScroll={shouldUpdateScroll}
        >
          {child}
        </ScrollContext>
      )
    }
  }

  loader.getResourcesForPathname(window.location.pathname, () => {
    const Root = () =>
      createElement(
        Router,
        {
          basepath: __PATH_PREFIX__,
        },
        createElement(RouteHandler, { path: `/*` })
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
