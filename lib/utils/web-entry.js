import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router'
import find from 'lodash/find'
import filter from 'lodash/filter'
import createRoutes from 'create-routes'
import app from 'app'

function loadConfig (cb) {
  const stuff = require('config')
  if (module.hot) {
    module.hot.accept(stuff.id, () => cb())
  }
  return cb()
}

loadConfig(() =>
  app.loadContext((pagesReq) => {
    let router
    const ref = require('config')
    let pages = ref.pages
    const config = ref.config
    let linkPrefix = config.linkPrefix
    if (!__PREFIX_LINKS__ || !linkPrefix) {
      linkPrefix = ''
    }

    const routes = createRoutes(pages, pagesReq)
    // Remove templates files.
    pages = filter(pages, (page) =>
      page.path !== null && page.path !== undefined
    )

    // Route already exists meaning we're hot-reloading.
    if (router) {
      router.replaceRoutes([routes])
    } else {
      router = Router.run([routes], Router.HistoryLocation, (Handler, state) => {
        let page
        page = find(pages, (p) => {
          const path = linkPrefix + p.path
          return path === state.path || path === state.pathname
        })

        // Let app know the route is changing.
        if (app.onRouteChange) {
          app.onRouteChange(state, page, pages, config)
        }

        return ReactDOM.render(
          <Handler
            config={config}
            pages={pages}
            page={page}
            state={state}
          />,
          typeof window !== 'undefined' ? document.getElementById('react-mount') : void 0)
      })
    }
  })
)
