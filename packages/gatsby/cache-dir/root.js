import React from "react"
import { Router, Location, BaseContext } from "@gatsbyjs/reach-router"
import { ScrollContext } from "gatsby-react-router-scroll"

import { shouldUpdateScroll, RouteUpdates } from "./navigation"
import { apiRunner } from "./api-runner-browser"
import loader from "./loader"
import { PageQueryStore, StaticQueryStore } from "./query-result-store"
import EnsureResources from "./ensure-resources"
import FastRefreshOverlay from "./fast-refresh-overlay"

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

    if (!loader.isPageNotFound(location.pathname + location.search)) {
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
                      (
                        locationAndPageResources.pageResources.page.matchPath ||
                        locationAndPageResources.pageResources.page.path
                      ).split(`?`)[0]
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
const rootWrappedWithWrapRootElement = apiRunner(
  `wrapRootElement`,
  { element: <Root /> },
  <Root />,
  ({ result, plugin }) => {
    return { element: result }
  }
).pop()

function RootWrappedWithOverlayAndProvider() {
  return (
    <FastRefreshOverlay>
      <StaticQueryStore>{rootWrappedWithWrapRootElement}</StaticQueryStore>
    </FastRefreshOverlay>
  )
}

export default RootWrappedWithOverlayAndProvider
