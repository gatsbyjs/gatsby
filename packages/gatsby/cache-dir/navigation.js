import loader, { setApiRunnerForLoader } from "./loader"
import redirects from "./redirects.json"
import { apiRunner } from "./api-runner-browser"
import emitter from "./emitter"
import { globalHistory } from "@reach/router/lib/history"
import { navigate as reachNavigate } from "@reach/router"
import parsePath from "./parse-path"

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
  }
}

const navigate = (to, options) => {
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
      loader.getResourcesForPathname(`/404.html`).then(response => {
        clearTimeout(timeoutId)
        onPreRouteUpdate(window.location)

        // Show the server's 404 page by navigating directly if a custom page
        // doesn't exist (otherwise the page contents won't change)
        if (!response) {
          window.location.href = to
        } else {
          // Try to load the page directly (as opposed to from the cache).
          //
          // Store the URL for testing later with `fetch`.
          let url = new URL(window.location)

          // Check the page isn't already loaded directly.
          if (!url.search.match(/(\?|&)no-cache=1$/)) {
            // Append the appropriate query to the URL
            if (url.search) {
              url.search += `&no-cache=1`
            } else {
              url.search = `?no-cache=1`
            }

            // Now test if the page is available directly
            fetch(url.href)
              .then(response => {
                if (response.status !== 404) {
                  // Redirect there if there isn't a 404. If a different HTTP
                  // error occurs, the appropriate error message will be
                  // displayed after loading the page directly.
                  window.location.replace(url)
                } else {
                  // If a 404 occurs, show the custom 404 page.
                  reachNavigate(to, options).then(() =>
                    onRouteUpdate(window.location)
                  )
                }
              })
              .catch(() => {
                // If an error occurs (usually when offline), navigate to the
                // page anyway to show the browser's proper offline error page
                window.location.replace(url)
              })
          }
        }
      })
    } else {
      onPreRouteUpdate(window.location)
      reachNavigate(to, options).then(() => onRouteUpdate(window.location))
      clearTimeout(timeoutId)
    }
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
  window.___push = to => navigate(to, { replace: false })
  window.___replace = to => navigate(to, { replace: true })
  window.___navigate = (to, options) => navigate(to, options)

  // Check for initial page-load redirect
  maybeRedirect(window.location.pathname)
}

export { init, shouldUpdateScroll, onRouteUpdate, onPreRouteUpdate }
