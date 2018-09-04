import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React, { createElement } from "react"
import ReactDOM from "react-dom"
import { Router, navigate } from "@reach/router"
import { ScrollContext } from "gatsby-react-router-scroll"
import domReady from "domready"
import {
  shouldUpdateScroll,
  init as navigationInit,
  onRouteUpdate,
  onPreRouteUpdate,
} from "./navigation"
import emitter from "./emitter"
window.___emitter = emitter
import PageRenderer from "./page-renderer"
import asyncRequires from "./async-requires"
import loader from "./loader"
import loadDirectlyOr404 from "./load-directly-or-404"

window.asyncRequires = asyncRequires
window.___emitter = emitter
window.___loader = loader

loader.addPagesArray([window.page])
loader.addDataPaths({ [window.page.jsonName]: window.dataPath })
loader.addProdRequires(asyncRequires)

navigationInit()

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Let plugins register a service worker. The plugin just needs
  // to return true.
  if (apiRunner(`registerServiceWorker`).length > 0) {
    require(`./register-service-worker`)
  }

  class RouteHandler extends React.Component {
    constructor(props) {
      super(props)
      onPreRouteUpdate(props.location)
    }

    render() {
      const { location } = this.props
      let child

      // TODO
      // check if hash + if element and if so scroll
      // remove hash handling from gatsby-link
      // check if scrollbehavior handles back button for
      // restoring old position
      // if not, add that.

      if (loader.getPage(location.pathname)) {
        child = createElement(PageRenderer, {
          isPage: true,
          ...this.props,
        })
      } else {
        child = createElement(PageRenderer, {
          isPage: true,
          location: { pathname: `/404.html` },
        })
      }

      return (
        <ScrollContext
          location={location}
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

  if (
    window.page &&
    window.page.path !== `/offline-plugin-app-shell-fallback/` &&
    __PATH_PREFIX__ + window.page.path !== window.location.pathname
  ) {
    navigate(
      __PATH_PREFIX__ +
        window.page.path +
        window.location.search +
        window.location.hash,
      { replace: true }
    )
  }

  loader
    .getResourcesForPathname(window.location.pathname)
    .then(() => {
      if (!loader.getPage(window.location.pathname)) {
        return loader
          .getResourcesForPathname(`/404.html`)
          .then(resources =>
            loadDirectlyOr404(
              resources,
              window.location.pathname +
                window.location.search +
                window.location.hash,
              true
            )
          )
      }
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
