if (__POLYFILL__) {
  require(`core-js/modules/es6.promise`)
}
import React from "react"
import ReactDOM from "react-dom"
import { AppContainer as HotContainer } from "react-hot-loader"
import domReady from "domready"

import socketIo from "./socketIo"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"

window.___emitter = require(`./emitter`)

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Hook up the client to socket.io on server
  socketIo()

  /**
   * Service Workers are persistent by nature. They stick around,
   * serving a cached version of the site if they aren't removed.
   * This is especially frustrating when you need to test the
   * production build on your local machine.
   *
   * Let's unregister the service workers in development, and tidy up a few errors.
   */
  if (supportsServiceWorkers(location, navigator)) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister()
      }
    })
  }

  const rootElement = document.getElementById(`___gatsby`)

  let Root = require(`./root`)
  if (Root.default) {
    Root = Root.default
  }

  const renderer = apiRunner(
    `replaceHydrateFunction`,
    undefined,
    ReactDOM.render
  )[0]

  domReady(() =>
    renderer(
      <HotContainer>
        <Root />
      </HotContainer>,
      rootElement,
      () => {
        apiRunner(`onInitialClientRender`)
      }
    )
  )

  if (module.hot) {
    module.hot.accept(`./root`, () => {
      let NextRoot = require(`./root`)
      if (NextRoot.default) {
        NextRoot = NextRoot.default
      }
      renderer(
        <HotContainer>
          <NextRoot />
        </HotContainer>,
        rootElement,
        () => {
          apiRunner(`onInitialClientRender`)
        }
      )
    })
  }
})

function supportsServiceWorkers(location, navigator) {
  if (location.hostname === `localhost` || location.protocol === `https:`) {
    return `serviceWorker` in navigator
  }
  return false
}
