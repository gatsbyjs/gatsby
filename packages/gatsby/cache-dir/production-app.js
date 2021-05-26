import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React from "react"
import ReactDOM from "react-dom"
import { Router, navigate, Location, BaseContext } from "@gatsbyjs/reach-router"
import { ScrollContext } from "gatsby-react-router-scroll"
import domReady from "@mikaelkristiansson/domready"
import { StaticQueryContext } from "gatsby"
import {
  shouldUpdateScroll,
  init as navigationInit,
  RouteUpdates,
} from "./navigation"
import emitter from "./emitter"
import PageRenderer from "./page-renderer"
import asyncRequires from "$virtual/async-requires"
import {
  setLoader,
  ProdLoader,
  publicLoader,
  PageResourceStatus,
  getStaticQueryResults,
} from "./loader"
import EnsureResources from "./ensure-resources"
import stripPrefix from "./strip-prefix"

// Generated during bootstrap
import matchPaths from "$virtual/match-paths.json"

const loader = new ProdLoader(asyncRequires, matchPaths)
setLoader(loader)
loader.setApiRunner(apiRunner)

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = publicLoader

navigationInit()

apiRunnerAsync(`onClientEntry`).then(() => {
  // Let plugins register a service worker. The plugin just needs
  // to return true.
  if (apiRunner(`registerServiceWorker`).filter(Boolean).length > 0) {
    require(`./register-service-worker`)
  }

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
      <PageRenderer {...props} />
    </BaseContext.Provider>
  )

  const DataContext = React.createContext({})

  class GatsbyRoot extends React.Component {
    render() {
      const { children } = this.props
      return (
        <Location>
          {({ location }) => (
            <EnsureResources location={location}>
              {({ pageResources, location }) => {
                const staticQueryResults = getStaticQueryResults()
                return (
                  <StaticQueryContext.Provider value={staticQueryResults}>
                    <DataContext.Provider value={{ pageResources, location }}>
                      {children}
                    </DataContext.Provider>
                  </StaticQueryContext.Provider>
                )
              }}
            </EnsureResources>
          )}
        </Location>
      )
    }
  }

  class LocationHandler extends React.Component {
    render() {
      return (
        <DataContext.Consumer>
          {({ pageResources, location }) => (
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
                    path={
                      pageResources.page.path === `/404.html`
                        ? stripPrefix(location.pathname, __BASE_PATH__)
                        : encodeURI(
                            pageResources.page.matchPath ||
                              pageResources.page.path
                          )
                    }
                    {...this.props}
                    location={location}
                    pageResources={pageResources}
                    {...pageResources.json}
                  />
                </Router>
              </ScrollContext>
            </RouteUpdates>
          )}
        </DataContext.Consumer>
      )
    }
  }

  const { pagePath, location: browserLoc } = window

  // Explicitly call navigate if the canonical path (window.pagePath)
  // is different to the browser path (window.location.pathname). But
  // only if NONE of the following conditions hold:
  //
  // - The url matches a client side route (page.matchPath)
  // - it's a 404 page
  // - it's the offline plugin shell (/offline-plugin-app-shell-fallback/)
  if (
    pagePath &&
    __BASE_PATH__ + pagePath !== browserLoc.pathname &&
    !(
      loader.findMatchPath(stripPrefix(browserLoc.pathname, __BASE_PATH__)) ||
      pagePath === `/404.html` ||
      pagePath.match(/^\/404\/?$/) ||
      pagePath.match(/^\/offline-plugin-app-shell-fallback\/?$/)
    )
  ) {
    navigate(__BASE_PATH__ + pagePath + browserLoc.search + browserLoc.hash, {
      replace: true,
    })
  }

  publicLoader.loadPage(browserLoc.pathname).then(page => {
    if (!page || page.status === PageResourceStatus.Error) {
      const message = `page resources for ${browserLoc.pathname} not found. Not rendering React`

      // if the chunk throws an error we want to capture the real error
      // This should help with https://github.com/gatsbyjs/gatsby/issues/19618
      if (page && page.error) {
        console.error(message)
        throw page.error
      }

      throw new Error(message)
    }

    window.___webpackCompilationHash = page.page.webpackCompilationHash

    const SiteRoot = apiRunner(
      `wrapRootElement`,
      { element: <LocationHandler /> },
      <LocationHandler />,
      ({ result }) => {
        return { element: result }
      }
    ).pop()

    const App = function App() {
      const onClientEntryRanRef = React.useRef(false)

      React.useEffect(() => {
        if (!onClientEntryRanRef.current) {
          onClientEntryRanRef.current = true
          performance.mark(`onInitialClientRender`)

          apiRunner(`onInitialClientRender`)
        }
      }, [])

      return <GatsbyRoot>{SiteRoot}</GatsbyRoot>
    }

    const renderer = apiRunner(
      `replaceHydrateFunction`,
      undefined,
      process.env.GATSBY_EXPERIMENTAL_CONCURRENT_FEATURES
        ? ReactDOM.unstable_createRoot
        : ReactDOM.hydrate
    )[0]

    domReady(() => {
      const container =
        typeof window !== `undefined`
          ? document.getElementById(`___gatsby`)
          : null

      if (renderer === ReactDOM.unstable_createRoot) {
        renderer(container, {
          hydrate: true,
        }).render(<App />)
      } else {
        renderer(<App />, container)
      }
    })
  })
})
