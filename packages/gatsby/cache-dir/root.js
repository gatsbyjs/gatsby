import React from "react"
import { Router, Location } from "@reach/router"
import { ScrollContext } from "gatsby-react-router-scroll"

import {
  shouldUpdateScroll,
  init as navigationInit,
  RouteUpdates,
} from "./navigation"
import { apiRunner } from "./api-runner-browser"
import loader from "./loader"
import JSONStore from "./json-store"
import EnsureResources from "./ensure-resources"

import { reportError, clearError } from "./error-overlay-handler"

if (window.__webpack_hot_middleware_reporter__ !== undefined) {
  const overlayErrorID = `webpack`
  // Report build errors
  window.__webpack_hot_middleware_reporter__.useCustomOverlay({
    showProblems(type, obj) {
      if (type !== `errors`) {
        clearError(overlayErrorID)
        return
      }
      reportError(overlayErrorID, obj[0])
    },
    clear() {
      clearError(overlayErrorID)
    },
  })
}

navigationInit()

class LocationHandler extends React.Component {
  render() {
    let { location } = this.props

    if (!loader.isPageNotFound(location.pathname)) {
      return (
        <EnsureResources location={location}>
          {locationAndPageResources => (
            <RouteUpdates location={location}>
              <ScrollContext
                location={location}
                shouldUpdateScroll={shouldUpdateScroll}
              >
                <Router
                  basepath={__BASE_PATH__}
                  location={location}
                  id="gatsby-focus-wrapper"
                >
                  <JSONStore
                    path={
                      locationAndPageResources.pageResources.page.matchPath ||
                      locationAndPageResources.pageResources.page.path
                    }
                    {...this.props}
                    {...locationAndPageResources}
                  />
                </Router>
              </ScrollContext>
            </RouteUpdates>
          )}
        </EnsureResources>
      )
    }

    const dev404PageResources = loader.loadPageSync(`/dev-404-page`)
    const real404PageResources = loader.loadPageSync(`/404.html`)
    let custom404
    if (real404PageResources) {
      custom404 = (
        <JSONStore {...this.props} pageResources={real404PageResources} />
      )
    }

    return (
      <RouteUpdates location={location}>
        <Router
          basepath={__BASE_PATH__}
          location={location}
          id="gatsby-focus-wrapper"
        >
          <JSONStore
            path={location.pathname}
            location={location}
            pageResources={dev404PageResources}
            custom404={custom404}
          />
        </Router>
      </RouteUpdates>
    )
  }
}

const Root = () => (
  <Location>
    {locationContext => <LocationHandler {...locationContext} />}
  </Location>
)

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(
  `wrapRootElement`,
  { element: <Root /> },
  <Root />,
  ({ result, plugin }) => {
    return { element: result }
  }
).pop()

export default () => WrappedRoot
