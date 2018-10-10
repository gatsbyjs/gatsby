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
window.___emitter = emitter
import PageRenderer from "./page-renderer"
import asyncRequires from "./async-requires"
import loader, { setApiRunnerForLoader } from "./loader"
import loadDirectlyOr404 from "./load-directly-or-404"
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
  // TODO: comment what this check does
  if (
    page &&
    page.path !== `/404.html` &&
    __PATH_PREFIX__ + page.path !== browserLoc.pathname &&
    !page.path.match(/^\/offline-plugin-app-shell-fallback\/?$/) &&
    (!page.matchPath ||
      !match(__PATH_PREFIX__ + page.matchPath, browserLoc.pathname))
  ) {
    navigate(
      __PATH_PREFIX__ + page.path + browserLoc.search + browserLoc.hash,
      { replace: true }
    )
  }

  loader
    .getResourcesForPathname(browserLoc.pathname)
    .then(resources => {
      if (!resources || resources.page.path === `/404.html`) {
        return loadDirectlyOr404(
          resources,
          browserLoc.pathname + browserLoc.search + browserLoc.hash,
          true
        )
      }

      return null
    })
    .then(() => {
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
