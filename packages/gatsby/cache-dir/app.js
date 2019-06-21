import React from "react"
import ReactDOM from "react-dom"
import domReady from "@mikaelkristiansson/domready"

import socketIo from "./socketIo"
import emitter from "./emitter"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import loader, { setApiRunnerForLoader } from "./loader"
import syncRequires from "./sync-requires"
import matchPaths from "./match-paths.json"

window.___emitter = emitter
setApiRunnerForLoader(apiRunner)

// Let the site/plugins run code very early.
apiRunnerAsync(`onClientEntry`).then(() => {
  // Hook up the client to socket.io on server
  const socket = socketIo()
  if (socket) {
    socket.on(`reload`, () => {
      window.location.reload()
    })
  }

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

  loader.addDevRequires(syncRequires)
  loader.addMatchPaths(matchPaths)
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
