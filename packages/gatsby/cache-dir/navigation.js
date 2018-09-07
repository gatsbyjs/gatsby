import loader, { setApiRunnerForLoader } from "./loader"
import redirects from "./redirects.json"
import { apiRunner } from "./api-runner-browser"
import emitter from "./emitter"
import {
  resolveRouteChangePromise,
  resetRouteChangePromise,
} from "./wait-for-route-change"
import { navigate as reachNavigate } from "@reach/router"
import parsePath from "./parse-path"
import loadDirectlyOr404 from "./load-directly-or-404"

// Convert to a map for faster lookup in maybeRedirect()
const redirectMap = redirects.reduce((map, redirect) => {
  map[redirect.fromPath] = redirect
  return map
}, {})

function maybeRedirect(pathname) {
  const redirect = redirectMap[pathname]

  if (redirect != null) {
    if (process.env.NODE_ENV !== `production`) {
      const pageResources = loader.getResourcesForPathnameSync(pathname)

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

const onPreRouteUpdate = location => {
  if (!maybeRedirect(location.pathname)) {
    apiRunner(`onPreRouteUpdate`, { location })
  }
}

const onRouteUpdate = location => {
  if (!maybeRedirect(location.pathname)) {
    apiRunner(`onRouteUpdate`, { location })
    resolveRouteChangePromise()

    // Temp hack while awaiting https://github.com/reach/router/issues/119
    window.__navigatingToLink = false
  }
}

const navigate = (to, options = {}) => {
  // Temp hack while awaiting https://github.com/reach/router/issues/119
  if (!options.replace) {
    window.__navigatingToLink = true
  }

  let { pathname } = parsePath(to)
  const redirect = redirectMap[pathname]

  // If we're redirecting, just replace the passed in pathname
  // to the one we want to redirect to.
  if (redirect) {
    to = redirect.toPath
    pathname = parsePath(to).pathname
  }

  // If we had a service worker update, no matter the path, reload window
  if (window.GATSBY_SW_UPDATED) {
    window.location = pathname
    return
  }

  resetRouteChangePromise()

  // Start a timer to wait for a second before transitioning and showing a
  // loader in case resources aren't around yet.
  const timeoutId = setTimeout(() => {
    emitter.emit(`onDelayedLoadPageResources`, { pathname })
    apiRunner(`onRouteUpdateDelayed`, {
      location: window.location,
    })
  }, 1000)

  loader.getResourcesForPathname(pathname).then(pageResources => {
    if (!pageResources && process.env.NODE_ENV === `production`) {
      loader.getResourcesForPathname(`/404.html`).then(resources => {
        clearTimeout(timeoutId)
        loadDirectlyOr404(resources, to).then(() => reachNavigate(to, options))
      })
    } else {
      reachNavigate(to, options)
      clearTimeout(timeoutId)
    }
  })
}

// reset route change promise after going back / forward
// in history (when not using Gatsby navigation)
window.addEventListener(`popstate`, () => {
  resetRouteChangePromise()
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

function init() {
  // Temp hack while awaiting https://github.com/reach/router/issues/119
  window.__navigatingToLink = false

  setApiRunnerForLoader(apiRunner)
  window.___loader = loader
  window.___push = to => navigate(to, { replace: false })
  window.___replace = to => navigate(to, { replace: true })
  window.___navigate = (to, options) => navigate(to, options)

  // Check for initial page-load redirect
  maybeRedirect(window.location.pathname)
}

export { init, shouldUpdateScroll, onRouteUpdate, onPreRouteUpdate }
