import loader, { setApiRunnerForLoader } from "./loader"
import redirects from "./redirects.json"
import { apiRunner } from "./api-runner-browser"
import { createLocation } from "history"
import emitter from "./emitter"

// Convert to a map for faster lookup in maybeRedirect()
const redirectMap = redirects.reduce((map, redirect) => {
  map[redirect.fromPath] = redirect
  return map
}, {})

function maybeRedirect(pathname) {
  const redirect = redirectMap[pathname]

  if (redirect != null) {
    if (process.env.NODE_ENV !== `production`) {
      const pageResources = loader.getResourcesForPathname(pathname)

      if (pageResources != null) {
        console.error(
          `The route "${pathname}" matches both a page and a redirect; this is probably not intentional.`
        )
      }
    }

    window.___replace(redirect.toPath)
    return true
  } else {
    return false
  }
}

let lastNavigateToLocationString = null

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

const navigate = (to, replace) => {
  const location = createLocation(to, null, null, history.location)
  let { pathname } = location
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

function init() {
  setApiRunnerForLoader(apiRunner)
  window.___loader = loader
  window.___push = to => navigate(to, false)
  window.___replace = to => navigate(to, true)

  // Check for initial page-load redirect
  maybeRedirect(window.location.pathname)
}

export { init, shouldUpdateScroll, attachToHistory }
