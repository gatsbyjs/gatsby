import React, { createElement } from "react"
import { Router } from "@reach/router"
import { ScrollContext } from "gatsby-react-router-scroll"
import {
  shouldUpdateScroll,
  init as navigationInit,
  onRouteUpdate,
  onPreRouteUpdate,
} from "./navigation"
import { apiRunner } from "./api-runner-browser"
import syncRequires from "./sync-requires"
import pages from "./pages.json"
import loader from "./loader"
import JSONStore from "./json-store"

import * as ErrorOverlay from "react-error-overlay"

// Report runtime errors
ErrorOverlay.startReportingRuntimeErrors({
  onError: () => {},
  filename: `/commons.js`,
})
ErrorOverlay.setEditorHandler(errorLocation =>
  window.fetch(
    `/__open-stack-frame-in-editor?fileName=` +
      window.encodeURIComponent(errorLocation.fileName) +
      `&lineNumber=` +
      window.encodeURIComponent(errorLocation.lineNumber || 1)
  )
)

if (window.__webpack_hot_middleware_reporter__ !== undefined) {
  // Report build errors
  window.__webpack_hot_middleware_reporter__.useCustomOverlay({
    showProblems(type, obj) {
      if (type !== `errors`) {
        ErrorOverlay.dismissBuildError()
        return
      }
      ErrorOverlay.reportBuildError(obj[0])
    },
    clear() {
      ErrorOverlay.dismissBuildError()
    },
  })
}

navigationInit()

class RouteHandler extends React.Component {
  constructor(props) {
    super(props)
    onPreRouteUpdate(props.location)
  }

  render() {
    let { location } = this.props
    const pageResources = loader.getResourcesForPathnameSync(location.pathname)
    const isPage = !!(pageResources && pageResources.component)
    let child
    if (isPage) {
      child = (
        <JSONStore
          pages={pages}
          {...this.props}
          pageResources={pageResources}
        />
      )
    } else if (loader.getPage(`/404.html`)) {
      location.pathname = `/404.html`
      child = (
        <JSONStore
          pages={pages}
          {...this.props}
          pageResources={loader.getResourcesForPathnameSync(location.pathname)}
        />
      )
    } else {
      const dev404Page = pages.find(p => /^\/dev-404-page\/$/.test(p.path))
      child = createElement(
        syncRequires.components[dev404Page.componentChunkName],
        {
          pages,
          ...this.props,
        }
      )
    }

    return (
      <ScrollContext
        location={location}
        history={this.props.history}
        shouldUpdateScroll={shouldUpdateScroll}
      >
        {child}
      </ScrollContext>
    )
  }

  // Call onRouteUpdate on the initial page load.
  componentDidMount() {
    onRouteUpdate(this.props.location)
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
