/* @flow weak */
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
//import createRoutes from 'create-routes'
import Html from 'html'
import _ from 'lodash'
//import { pages, config } from 'config'
//import { prefixLink } from '../isomorphic/gatsby-helpers'
//import { routesDB } from './globals'
import childRoutes from '.gatsby-intermediate-build/child-routes.js'
const routes = {
  childRoutes,
}

module.exports = (locals, callback) => {
  match({ routes, location: locals.path }, (error, redirectLocation, renderProps) => {
    if (error) {
      console.log(`error when building page ${locals.path}`, error)
      callback(error)
    } else if (renderProps) {
      const component = (
        <RouterContext
          {...renderProps}
        />
      )
      const body = renderToString(component)

      const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(
        <Html
          body={body}
          {...renderProps}
          pathJSFile={`path---${locals.path === '/' ? 'index' : _.kebabCase(locals.path)}`}
          componentName={_.find(childRoutes, (child) => child.path === locals.path).componentName}
        />
      )}`
      callback(null, html)
    }
  })
}
