/* @flow weak */
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import createRoutes from 'create-routes'
import Html from 'html'
import { pages, config } from 'config'
import { prefixLink } from '../isomorphic/gatsby-helpers'
import { wrapRootComponent } from 'gatsby-ssr'

const loadContext = require('.gatsby-context')

let routes
loadContext((pagesReq) => {
  routes = createRoutes(pages, pagesReq)
})

module.exports = (locals, callback) => {
  match({ routes, location: prefixLink(locals.path) }, (error, redirectLocation, renderProps) => {
    if (error) {
      console.log(error)
      callback(error)
    } else if (renderProps) {
      const componentToWrap = () => (<RouterContext {...renderProps} />)
      let body
      let component

      if (wrapRootComponent) {
        component = wrapRootComponent(componentToWrap)
      } else {
        component = componentToWrap
      }

      // If we're not generating a SPA for production, eliminate React IDs.
      if (config.noProductionJavascript) {
        body = renderToStaticMarkup(component())
      } else {
        body = renderToString(component())
      }

      const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(
        // eslint-disable-next-line comma-dangle
        <Html body={body} {...renderProps} />
      )}`
      callback(null, html)
    }
  })
}
