import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import Html from 'html'
import _ from 'lodash'
//import { prefixLink } from '../isomorphic/gatsby-helpers'
import rootRoute from '.intermediate-representation/child-routes.js'
import pages from 'public/tmp-pages.json'
//import { pathChunkName } from './js-chunk-names'
import apiRunner from '.intermediate-representation/api-runner-ssr'

const pathChunkName = (path) => {
  const name = path === `/` ? `index` : _.kebabCase(path)
  return `path---${name}`
}

module.exports = (locals, callback) => {
  let linkPrefix = ``
  if (__PREFIX_LINKS__) {
    linkPrefix = __LINK_PREFIX__
  }

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
      let { body, headComponents, postBodyComponents, ...bodyRenderProps } = results[0]

      // If no one stepped up, we'll handle it.
      if (!body) {
        body = renderToString(component)
      }

      // Check if vars were created.
      if (!bodyRenderProps) {
        bodyRenderProps = {}
      }
      if (!headComponents) {
        headComponents = []
      }
      if (!postBodyComponents) {
        postBodyComponents = []
      }

      // Add the chunk-manifest as a head component.
      const chunkManifest = require(`!raw!public/chunk-manifest.json`)

      headComponents.push(
        <script
          id="webpack-manifest"
          dangerouslySetInnerHTML={{ __html:
            `
            //<![CDATA[
            window.webpackManifest = ${chunkManifest}
            //]]>
            `,
          }}
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
        //const prefixedScript = prefixLink(`/${_.get(stats, fetchKey, ``)}`)
        const prefixedScript = `${linkPrefix}/${_.get(stats, fetchKey, ``)}`

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

      // Call plugins to let them add to or modify components/props.
      const pluginHeadComponents = apiRunner(`modifyHeadComponents`, { headComponents }, [])
      headComponents = headComponents.concat(pluginHeadComponents)

      const pluginPostBodyComponents = apiRunner(`modifyPostBodyComponents`, { postBodyComponents }, [])
      postBodyComponents = postBodyComponents.concat(pluginPostBodyComponents)

      const pluginBodyRenderProps = apiRunner(`modifyBodyRenderProps`, { bodyRenderProps }, {})
      bodyRenderProps = _.merge(bodyRenderProps, pluginBodyRenderProps)

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
