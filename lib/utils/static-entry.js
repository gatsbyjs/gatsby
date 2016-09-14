/* @flow weak */
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
//import createRoutes from 'create-routes'
import Html from 'html'
import _ from 'lodash'
import { prefixLink } from '../isomorphic/gatsby-helpers'
import childRoutes from '.intermediate-build/child-routes.js'
import pages from 'public/tmp-pages.json'
import { layoutComponentChunkName, pathChunkName } from './js-chunk-names'
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

      // TODO create function which takes a path object and returns an array of scripts
      const scripts = ['commons', 'routes']
      // Path chunk.
      scripts.push(prefixLink(pathChunkName(locals.path)))
      // layout component chunk
      scripts.push(
        prefixLink(
          layoutComponentChunkName(
             pages.find((page) => page.path === locals.path).component
          )
        )
      )

      const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(
        <Html
          body={body}
          {...renderProps}
          scripts={scripts}
        />
      )}`
      callback(null, html)
    }
  })
}
