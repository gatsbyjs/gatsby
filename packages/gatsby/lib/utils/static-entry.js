import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import Html from 'html'
import _ from 'lodash'
import { prefixLink } from '../isomorphic/gatsby-helpers'
import rootRoute from '.intermediate-representation/child-routes.js'
import pages from 'public/tmp-pages.json'
import { pathChunkName } from './js-chunk-names'
import apiRunner from '../utils/api-runner-ssr'

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

      // Let the site or plugin render the page component.
      const results = apiRunner(
        `replaceServerBodyRender`,
        { component, headComponents: [] },
        {},
      )
      let { body, headComponents, postBodyComponents, ...bodyRenderProps } = results

      // If no one stepped up, we'll handle it.
      if (!body) {
        body = renderToString(component)
        bodyRenderProps = {}
      }

      if (!headComponents) {
        headComponents = []
      }

      if (!postBodyComponents) {
        postBodyComponents = []
      }

      // Add the chunk-manifest as a head component.
      const chunkManifest = require('!raw!public/chunk-manifest.json')

      headComponents.push(
        <script
          id="webpack-manifest"
          dangerouslySetInnerHTML={{ __html: `
          //<![CDATA[
          window.webpackManifest = ${chunkManifest}
          //]]>
          ` }}
        />
      )

      let stats
      try {
        stats = require(`public/stats.json`)
      } catch (e) {
        // ignore
      }
      const dascripts = [
        pages.find((page) => page.path === locals.path).componentChunkName,
        pathChunkName(locals.path),
        `app`,
        `commons`,
      ]
      dascripts.forEach((script) => {
        const fetchKey = `assetsByChunkName[${script}][0]`
        const prefixedScript = prefixLink(`/${_.get(stats, fetchKey, ``)}`)

        // Add preload <link>s for scripts.
        headComponents.unshift(
          <link
            rel="preload"
            href={prefixedScript}
            as="script"
          />
        )

        // Add script tags for the bottom of the page.
        postBodyComponents.unshift(
          <script key={prefixedScript} src={prefixedScript} />
        )
      })

      const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(
        <Html
          {...bodyRenderProps}
          headComponents={headComponents}
          postBodyComponents={postBodyComponents}
          body={body}
          {...renderProps}
        />
      )}`
      callback(null, html)
    } else {
      console.log(`Couldn't match ${locals.path} against your routes. This
      should NEVER happen.`)
      callback(null, `FAIL ALERT`)
    }
  })
}
