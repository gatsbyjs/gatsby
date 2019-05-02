import React, { createElement } from "react"
import { Router } from "@reach/router"
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

class RouteHandler extends React.Component {
  render() {
    let { location } = this.props

    // check if page exists - in dev pages are sync loaded, it's safe to use
    // loader.getPage
    let page = loader.getPage(location.pathname)

    if (page) {
      return (
        <EnsureResources location={location}>
          {locationAndPageResources => (
            <RouteUpdates location={location}>
              <ScrollContext
                location={location}
                shouldUpdateScroll={shouldUpdateScroll}
              >
                <JSONStore {...this.props} {...locationAndPageResources} />
              </ScrollContext>
            </RouteUpdates>
          )}
        </EnsureResources>
      )
    } else {
      const dev404PageResources = loader.getResourcesForPathnameSync(
        `/dev-404-page/`
      )
      const real404PageResources = loader.getResourcesForPathnameSync(
        `/404.html`
      )
      let custom404
      if (real404PageResources) {
        custom404 = (
          <JSONStore {...this.props} pageResources={real404PageResources} />
        )
      }

      return (
        <RouteUpdates location={location}>
          <JSONStore
            location={location}
            pageResources={dev404PageResources}
            custom404={custom404}
          />
        </RouteUpdates>
      )
    }
  }
}

const Root = () =>
  createElement(
    Router,
    {
      basepath: __BASE_PATH__,
    },
    createElement(RouteHandler, { path: `/*` })
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
