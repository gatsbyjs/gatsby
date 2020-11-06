import React from "react"
import PropTypes from "prop-types"
import loader, { PageResourceStatus } from "./loader"
import redirects from "./redirects.json"
import { apiRunner } from "./api-runner-browser"
import emitter from "./emitter"
import { RouteAnnouncerProps } from "./route-announcer-props"
import { navigate as reachNavigate } from "@reach/router"
import { globalHistory } from "@reach/router/lib/history"
import { parsePath } from "gatsby-link"

// Convert to a map for faster lookup in maybeRedirect()
const redirectMap = redirects.reduce((map, redirect) => {
  map[redirect.fromPath] = redirect
  return map
}, {})

function maybeRedirect(pathname) {
  const redirect = redirectMap[pathname]

  if (redirect != null) {
    if (process.env.NODE_ENV !== `production`) {
      if (!loader.isPageNotFound(pathname)) {
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

const onPreRouteUpdate = (location, prevLocation) => {
  if (!maybeRedirect(location.pathname)) {
    apiRunner(`onPreRouteUpdate`, { location, prevLocation })
  }
}

const onRouteUpdate = (location, prevLocation) => {
  if (!maybeRedirect(location.pathname)) {
    apiRunner(`onRouteUpdate`, { location, prevLocation })
  }
}

const navigate = (to, options = {}) => {
  // Support forward/backward navigation with numbers
  // navigate(-2) (jumps back 2 history steps)
  // navigate(2)  (jumps forward 2 history steps)
  if (typeof to === `number`) {
    globalHistory.navigate(to)
    return
  }

  let { pathname } = parsePath(to)
  const redirect = redirectMap[pathname]

  // If we're redirecting, just replace the passed in pathname
  // to the one we want to redirect to.
  if (redirect) {
    to = redirect.toPath
    pathname = parsePath(to).pathname
  }

  // If we had a service worker update, no matter the path, reload window and
  // reset the pathname whitelist
  if (window.___swUpdated) {
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

  loader.loadPage(pathname).then(pageResources => {
    // If no page resources, then refresh the page
    // Do this, rather than simply `window.location.reload()`, so that
    // pressing the back/forward buttons work - otherwise when pressing
    // back, the browser will just change the URL and expect JS to handle
    // the change, which won't always work since it might not be a Gatsby
    // page.
    if (!pageResources || pageResources.status === PageResourceStatus.Error) {
      window.history.replaceState({}, ``, location.href)
      window.location = pathname
      clearTimeout(timeoutId)
      return
    }

    // If the loaded page has a different compilation hash to the
    // window, then a rebuild has occurred on the server. Reload.
    if (process.env.NODE_ENV === `production` && pageResources) {
      if (
        pageResources.page.webpackCompilationHash !==
        window.___webpackCompilationHash
      ) {
        // Purge plugin-offline cache
        if (
          `serviceWorker` in navigator &&
          navigator.serviceWorker.controller !== null &&
          navigator.serviceWorker.controller.state === `activated`
        ) {
          navigator.serviceWorker.controller.postMessage({
            gatsbyApi: `clearPathResources`,
          })
        }

        window.location = pathname
      }
    }
    reachNavigate(to, options)
    clearTimeout(timeoutId)
  })
}

function shouldUpdateScroll(prevRouterProps, { location }) {
  const { pathname, hash } = location
  const results = apiRunner(`shouldUpdateScroll`, {
    prevRouterProps,
    // `pathname` for backwards compatibility
    pathname,
    routerProps: { location },
    getSavedScrollPosition: args => this._stateStorage.read(args),
  })
  if (results.length > 0) {
    // Use the latest registered shouldUpdateScroll result, this allows users to override plugin's configuration
    // @see https://github.com/gatsbyjs/gatsby/issues/12038
    return results[results.length - 1]
  }

  if (prevRouterProps) {
    const {
      location: { pathname: oldPathname },
    } = prevRouterProps
    if (oldPathname === pathname) {
      // Scroll to element if it exists, if it doesn't, or no hash is provided,
      // scroll to top.
      return hash ? decodeURI(hash.slice(1)) : [0, 0]
    }
  }
  return true
}

function init() {
  // The "scroll-behavior" package expects the "action" to be on the location
  // object so let's copy it over.
  globalHistory.listen(args => {
    args.location.action = args.action
  })

  window.___push = to => navigate(to, { replace: false })
  window.___replace = to => navigate(to, { replace: true })
  window.___navigate = (to, options) => navigate(to, options)

  // Check for initial page-load redirect
  maybeRedirect(window.location.pathname)
}

class RouteAnnouncer extends React.Component {
  constructor(props) {
    super(props)
    this.announcementRef = React.createRef()
  }

  componentDidUpdate(prevProps, nextProps) {
    requestAnimationFrame(() => {
      let pageName = `new page at ${this.props.location.pathname}`
      if (document.title) {
        pageName = document.title
      }
      const pageHeadings = document.querySelectorAll(`#gatsby-focus-wrapper h1`)
      if (pageHeadings && pageHeadings.length) {
        pageName = pageHeadings[0].textContent
      }
      const newAnnouncement = `Navigated to ${pageName}`
      if (this.announcementRef.current) {
        const oldAnnouncement = this.announcementRef.current.innerText
        if (oldAnnouncement !== newAnnouncement) {
          this.announcementRef.current.innerText = newAnnouncement
        }
      }
    })
  }

  render() {
    return <div {...RouteAnnouncerProps} ref={this.announcementRef}></div>
  }
}

// Fire on(Pre)RouteUpdate APIs
class RouteUpdates extends React.Component {
  constructor(props) {
    super(props)
    onPreRouteUpdate(props.location, null)
  }

  componentDidMount() {
    onRouteUpdate(this.props.location, null)
  }

  shouldComponentUpdate(prevProps) {
    if (this.props.location.href !== prevProps.location.href) {
      onPreRouteUpdate(this.props.location, prevProps.location)
      return true
    }

    return false
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.href !== prevProps.location.href) {
      onRouteUpdate(this.props.location, prevProps.location)
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children}
        <RouteAnnouncer location={location} />
      </React.Fragment>
    )
  }
}

RouteUpdates.propTypes = {
  location: PropTypes.object.isRequired,
}

export { init, shouldUpdateScroll, RouteUpdates }
