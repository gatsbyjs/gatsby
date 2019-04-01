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
import devLoader from "./dev-loader"
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
    const pages = devLoader.getPagesManifest()
    const pagePaths = Object.keys(pages)

    if (!loader.isPageNotFound(location.pathname)) {
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
      const dev404Page = loader.getPage(`/dev-404-page/`)
      const Dev404Page = dev404Page.component

      if (!loader.getPage(`/404.html`)) {
        return (
          <RouteUpdates location={location}>
            <Dev404Page {...this.props} pagePaths={pagePaths} />
          </RouteUpdates>
        )
      }

      return (
        <EnsureResources location={location}>
          {locationAndPageResources => (
            <RouteUpdates location={location}>
              <Dev404Page
                pagePaths={pagePaths}
                custom404={
                  <JSONStore {...this.props} {...locationAndPageResources} />
                }
                {...this.props}
              />
            </RouteUpdates>
          )}
        </EnsureResources>
      )
    }
  }
}

const Root = () =>
  createElement(
    Router,
    {
      basepath: __PATH_PREFIX__,
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
