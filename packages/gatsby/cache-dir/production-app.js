import React, { createElement } from "react"
import ReactDOM from "react-dom"
import domReady from "@mikaelkristiansson/domready"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import { Router, navigate } from "@reach/router"
import { setLoader, ProdLoader } from "./loader"
import asyncRequires from "./async-requires"
import emitter from "./emitter"
import PageRenderer from "./page-renderer"
import { ScrollContext } from "gatsby-react-router-scroll"
import {
  shouldUpdateScroll,
  RouteUpdates,
  init as navigationInit,
} from "./navigation"
import PageChanger from "./page-changer"
// Generated during bootstrap
import matchPaths from "./match-paths.json"

const loader = new ProdLoader(asyncRequires, matchPaths)
setLoader(loader)
loader.setApiRunner(apiRunner)

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = loader
window.___webpackCompilationHash = window.webpackCompilationHash

navigationInit()

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
        <PageChanger location={location}>
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
        </PageChanger>
      )
    }
  }

  const { pagePath, location: browserLoc } = window
  if (
    // Make sure the window.page object is defined
    pagePath &&
    // The canonical path doesn't match the actual path (i.e. the address bar)
    __BASE_PATH__ + pagePath !== browserLoc.pathname &&
    // Ignore 404 pages, since we want to keep the same URL
    pagePath !== `/404.html` &&
    !pagePath.match(/^\/404\/?$/) &&
    // Also ignore the offline shell (since when using the offline plugin, all
    // pages have this canonical path)
    !pagePath.match(/^\/offline-plugin-app-shell-fallback\/?$/)
  ) {
    navigate(__BASE_PATH__ + pagePath + browserLoc.search + browserLoc.hash, {
      replace: true,
    })
  }

  loader.loadPage(browserLoc.pathname).then(page => {
    if (!page) {
      console.log(
        `page resources for ${
          browserLoc.pathname
        } not found. Not rendering React`
      )
      return
    }
    const Root = () =>
      createElement(
        Router,
        {
          basepath: __BASE_PATH__,
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
