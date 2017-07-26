const apiRunner = require(`./api-runner-browser`)

import React from "react"
import ReactDOM from "react-dom"
import { AppContainer as HotContainer } from "react-hot-loader"
import socketIo from "./socketIo"

window.___emitter = require(`./emitter`)

// Let the site/plugins run code very early.
apiRunner(`onClientEntry`)

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
if (`serviceWorker` in navigator) {
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

ReactDOM.render(
  <HotContainer>
    <Root />
  </HotContainer>,
  rootElement,
  () => { apiRunner(`onInitialClientRender`) }
)

if (module.hot) {
  module.hot.accept(`./root`, () => {
    let NextRoot = require(`./root`)
    if (NextRoot.default) {
      NextRoot = NextRoot.default
    }
    ReactDOM.render(
      <HotContainer>
        <NextRoot />
      </HotContainer>,
      rootElement,
      () => { apiRunner(`onInitialClientRender`) }
    )
  })
}
