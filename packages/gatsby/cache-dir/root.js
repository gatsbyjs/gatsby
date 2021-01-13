import React from "react"
import { Router, Location, BaseContext } from "@reach/router"
import { ScrollContext } from "gatsby-react-router-scroll"

import {
  shouldUpdateScroll,
  init as navigationInit,
  RouteUpdates,
} from "./navigation"
import { apiRunner } from "./api-runner-browser"
import loader from "./loader"
import { PageQueryStore, StaticQueryStore } from "./query-result-store"
import EnsureResources from "./ensure-resources"
import FastRefreshOverlay from "./fast-refresh-overlay"

import { reportError, clearError } from "./error-overlay-handler"
import { LoadingIndicatorEventHandler } from "./loading-indicator"

// TODO: Remove entire block when we make fast-refresh the default
// In fast-refresh, this logic is all moved into the `error-overlay-handler`
if (
  window.__webpack_hot_middleware_reporter__ !== undefined &&
  process.env.GATSBY_HOT_LOADER !== `fast-refresh`
) {
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

// In gatsby v2 if Router is used in page using matchPaths
// paths need to contain full path.
// For example:
//   - page have `/app/*` matchPath
//   - inside template user needs to use `/app/xyz` as path
// Resetting `basepath`/`baseuri` keeps current behaviour
// to not introduce breaking change.
// Remove this in v3
const RouteHandler = props => (
  <BaseContext.Provider
    value={{
      baseuri: `/`,
      basepath: `/`,
    }}
  >
    <PageQueryStore {...props} />
  </BaseContext.Provider>
)

class LocationHandler extends React.Component {
  render() {
    const { location } = this.props

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
                  <RouteHandler
                    path={encodeURI(
                      locationAndPageResources.pageResources.page.matchPath ||
                        locationAndPageResources.pageResources.page.path
                    )}
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
        <PageQueryStore {...this.props} pageResources={real404PageResources} />
      )
    }

    return (
      <RouteUpdates location={location}>
        <Router
          basepath={__BASE_PATH__}
          location={location}
          id="gatsby-focus-wrapper"
        >
          <RouteHandler
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

const ConditionalFastRefreshOverlay = ({ children }) => {
  if (process.env.GATSBY_HOT_LOADER === `fast-refresh`) {
    return <FastRefreshOverlay>{children}</FastRefreshOverlay>
  }

  return <React.Fragment>{children}</React.Fragment>
}

export default () => (
  <ConditionalFastRefreshOverlay>
    <StaticQueryStore>{WrappedRoot}</StaticQueryStore>
    {process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND &&
      process.env.GATSBY_QUERY_ON_DEMAND_LOADING_INDICATOR === `true` && (
        <LoadingIndicatorEventHandler />
      )}
  </ConditionalFastRefreshOverlay>
)
