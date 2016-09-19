/* @flow weak */
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import Html from 'html'
import _ from 'lodash'
import { prefixLink } from '../isomorphic/gatsby-helpers'
import rootRoute from '.intermediate-build/child-routes.js'
import pages from 'public/tmp-pages.json'
import { layoutComponentChunkName, pathChunkName } from './js-chunk-names'

module.exports = (locals, callback) => {
  match({ routes: rootRoute, location: locals.path }, (error, redirectLocation, renderProps) => {
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

      const scripts = ['commons', 'app']
      // Path chunk.
      scripts.push(pathChunkName(locals.path))
      // layout component chunk
      scripts.push(
        layoutComponentChunkName(
           pages.find((page) => page.path === locals.path).component
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
    } else {
      console.log(`Couldn't match ${locals.path} against your routes. This
      should NEVER happen.`)
      callback(null, 'FAIL ALERT')
    }
  })
}
