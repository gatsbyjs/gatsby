import React from "react"
import ReactDOM from "react-dom"
import domReady from "domready"

import socketIo from "./socketIo"
import emitter from "./emitter"
import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import loader, { setApiRunnerForLoader, postInitialRenderWork } from "./loader"
import syncRequires from "./sync-requires"
import pages from "./pages.json"

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

  const rootElement = document.getElementById(`___gatsby`)

  const renderer = apiRunner(
    `replaceHydrateFunction`,
    undefined,
    ReactDOM.render
  )[0]

  loader.addPagesArray(pages)
  loader.addDevRequires(syncRequires)

  loader.getResourcesForPathname(window.location.pathname).then(() => {
    const preferDefault = m => (m && m.default) || m
    let Root = preferDefault(require(`./root`))
    domReady(() => {
      renderer(<Root />, rootElement, () => {
        postInitialRenderWork()
        apiRunner(`onInitialClientRender`)
      })
    })
  })
})
