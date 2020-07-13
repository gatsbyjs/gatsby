import React from "react"
import ReactDOM from "react-dom"
import domReady from "@mikaelkristiansson/domready"
import io from "socket.io-client"

import socketIo from "./socketIo"
import emitter from "./emitter"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import { setLoader, publicLoader } from "./loader"
import DevLoader from "./dev-loader"
import syncRequires from "$virtual/sync-requires"
// Generated during bootstrap
import matchPaths from "$virtual/match-paths.json"

window.___emitter = emitter

const loader = new DevLoader(syncRequires, matchPaths)
setLoader(loader)
loader.setApiRunner(apiRunner)

window.___loader = publicLoader

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
        const parentSocket = io(
          `http://${window.location.hostname}:${services.developstatusserver.port}`
        )

        parentSocket.on(`develop:needs-restart`, msg => {
          if (
            window.confirm(
              `The develop process needs to be restarted for the changes to ${msg.dirtyFile} to be applied.\nDo you want to restart the develop process now?`
            )
          ) {
            parentSocket.once(`develop:is-starting`, msg => {
              window.location.reload()
            })
            parentSocket.once(`develop:started`, msg => {
              window.location.reload()
            })
            parentSocket.emit(`develop:restart`)
          }
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
    ReactDOM.render
  )[0]

  Promise.all([
    loader.loadPage(`/dev-404-page/`),
    loader.loadPage(`/404.html`),
    loader.loadPage(window.location.pathname),
  ]).then(() => {
    const preferDefault = m => (m && m.default) || m
    let Root = preferDefault(require(`./root`))
    domReady(() => {
      renderer(<Root />, rootElement, () => {
        apiRunner(`onInitialClientRender`)
      })
    })
  })
})
