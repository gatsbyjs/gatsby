import React from "react"
import ReactDOM from "react-dom"
import domReady from "@mikaelkristiansson/domready"
import io from "socket.io-client"

import socketIo from "./socketIo"
import emitter from "./emitter"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import { setLoader, publicLoader } from "./loader"
import DevLoader from "./dev-loader"
// Generated during bootstrap
import matchPaths from "$virtual/match-paths.json"

window.___emitter = emitter

let pageComponentRequires
if (process.env.GATSBY_EXPERIMENTAL_LAZY_DEVJS) {
  pageComponentRequires = require(`$virtual/lazy-client-sync-requires`)
} else {
  pageComponentRequires = require(`$virtual/sync-requires`)
}

const loader = new DevLoader(pageComponentRequires, matchPaths)
setLoader(loader)
loader.setApiRunner(apiRunner)

window.___loader = publicLoader

// Do dummy dynamic import so the jsonp __webpack_require__.e is added to the commons.js
// bundle. This ensures hot reloading doesn't break when someone first adds
// a dynamic import.
//
// Without this, the runtime breaks with a
// "TypeError: __webpack_require__.e is not a function"
// error.
// eslint-disable-next-line
import("./dummy")

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Hook up the client to socket.io on server
  const socket = socketIo()
  if (socket) {
    socket.on(`reload`, () => {
      window.location.reload()
    })
  }

  fetch(`/___services`)
    .then(res => res.json())
    .then(services => {
      if (services.developstatusserver) {
        let isRestarting = false
        const parentSocket = io(
          `${window.location.protocol}//${window.location.hostname}:${services.developstatusserver.port}`
        )

        parentSocket.on(`structured-log`, msg => {
          if (
            !isRestarting &&
            msg.type === `LOG_ACTION` &&
            msg.action.type === `DEVELOP` &&
            msg.action.payload === `RESTART_REQUIRED` &&
            window.confirm(
              `The develop process needs to be restarted for the changes to ${msg.action.dirtyFile} to be applied.\nDo you want to restart the develop process now?`
            )
          ) {
            isRestarting = true
            parentSocket.emit(`develop:restart`, () => {
              window.location.reload()
            })
          }

          if (
            isRestarting &&
            msg.type === `LOG_ACTION` &&
            msg.action.type === `SET_STATUS` &&
            msg.action.payload === `SUCCESS`
          ) {
            isRestarting = false
            window.location.reload()
          }
        })

        // Prevents certain browsers spamming XHR 'ERR_CONNECTION_REFUSED'
        // errors within the console, such as when exiting the develop process.
        parentSocket.on(`disconnect`, () => {
          console.warn(
            `[socket.io] Disconnected. Unable to perform health-check.`
          )
          parentSocket.close()
        })
      }
    })

  /**
   * Service Workers are persistent by nature. They stick around,
   * serving a cached version of the site if they aren't removed.
   * This is especially frustrating when you need to test the
   * production build on your local machine.
   *
   * Let's warn if we find service workers in development.
   */
  if (`serviceWorker` in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0)
        console.warn(
          `Warning: found one or more service workers present.`,
          `If your site isn't behaving as expected, you might want to remove these.`,
          registrations
        )
    })
  }

  const rootElement = document.getElementById(`___gatsby`)

  const renderer = apiRunner(
    `replaceHydrateFunction`,
    undefined,
    // TODO replace with hydrate once dev SSR is ready
    // but only for SSRed pages.
    ReactDOM.render
  )[0]

  Promise.all([
    loader.loadPage(`/dev-404-page/`),
    loader.loadPage(`/404.html`),
    loader.loadPage(window.location.pathname),
  ]).then(() => {
    const preferDefault = m => (m && m.default) || m
    const Root = preferDefault(require(`./root`))
    domReady(() => {
      renderer(<Root />, rootElement, () => {
        apiRunner(`onInitialClientRender`)
      })
    })
  })
})
