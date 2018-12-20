import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React, { createElement } from "react"
import ReactDOM from "react-dom"
import { Router, navigate } from "@reach/router"
import { match } from "@reach/router/lib/utils"
import { ScrollContext } from "gatsby-react-router-scroll"
import domReady from "domready"
import {
  shouldUpdateScroll,
  init as navigationInit,
  RouteUpdates,
} from "./navigation"
import emitter from "./emitter"
import PageRenderer from "./page-renderer"
import asyncRequires from "./async-requires"
import loader, { setApiRunnerForLoader } from "./loader"
import EnsureResources from "./ensure-resources"

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = loader

loader.addPagesArray([window.page])
loader.addDataPaths({ [window.page.jsonName]: window.dataPath })
loader.addProdRequires(asyncRequires)
setApiRunnerForLoader(apiRunner)

navigationInit()

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Let plugins register a service worker. The plugin just needs
  // to return true.
  if (apiRunner(`registerServiceWorker`).length > 0) {
    require(`./register-service-worker`)
  }

  class RouteHandler extends React.Component {
    render() {
      let { location } = this.props

      return (
        <EnsureResources location={location}>
          {({ pageResources, location }) => (
            <RouteUpdates location={location}>
              <ScrollContext
                location={location}
                shouldUpdateScroll={shouldUpdateScroll}
              >
                <PageRenderer
                  {...this.props}
                  location={location}
                  pageResources={pageResources}
                  {...pageResources.json}
                />
              </ScrollContext>
            </RouteUpdates>
          )}
        </EnsureResources>
      )
    }
  }

  const { page, location: browserLoc } = window
  if (
    // Make sure the window.page object is defined
    page &&
    // The canonical path doesn't match the actual path (i.e. the address bar)
    __PATH_PREFIX__ + page.path !== browserLoc.pathname &&
    // ...and if matchPage is specified, it also doesn't match the actual path
    (!page.matchPath ||
      !match(__PATH_PREFIX__ + page.matchPath, browserLoc.pathname)) &&
    // Ignore 404 pages, since we want to keep the same URL
    page.path !== `/404.html` &&
    !page.path.match(/^\/404\/?$/) &&
    // Also ignore the offline shell (since when using the offline plugin, all
    // pages have this canonical path)
    !page.path.match(/^\/offline-plugin-app-shell-fallback\/?$/)
  ) {
    navigate(
      __PATH_PREFIX__ + page.path + browserLoc.search + browserLoc.hash,
      { replace: true }
    )
  }

  loader.getResourcesForPathname(browserLoc.pathname).then(() => {
    const Root = () =>
      createElement(
        Router,
        {
          basepath: __PATH_PREFIX__,
        },
        createElement(RouteHandler, { path: `/*` })
      )

    const WrappedRoot = apiRunner(
      `wrapRootElement`,
      { element: <Root /> },
      <Root />,
      ({ result }) => {
        return { element: result }
      }
    ).pop()

    let NewRoot = () => WrappedRoot

    const renderer = apiRunner(
      `replaceHydrateFunction`,
      undefined,
      ReactDOM.hydrate
    )[0]

    domReady(() => {
      renderer(
        <NewRoot />,
        typeof window !== `undefined`
          ? document.getElementById(`___gatsby`)
          : void 0,
        () => {
          apiRunner(`onInitialClientRender`)
        }
      )
    })
  })
})
