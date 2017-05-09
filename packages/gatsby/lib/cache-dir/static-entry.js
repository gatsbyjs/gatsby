import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { StaticRouter, Switch, Route } from "react-router-dom"
import Html from "../src/html"
import { kebabCase, get, merge } from "lodash"
import rootRoute from "./child-routes"
import apiRunner from "./api-runner-ssr"
import pages from "./routes.json"
import syncRequires from "./sync-requires"

const pathChunkName = path => {
  const name = path === `/` ? `index` : kebabCase(path)
  return `path---${name}`
}

const $ = React.createElement

const filteredPages = pages.filter(r => r.path !== `/404.html`)
const noMatch = pages.find(r => r.path === `/404.html`)

module.exports = (locals, callback) => {
  let linkPrefix = `/`
  if (__PREFIX_LINKS__) {
    linkPrefix = `${__LINK_PREFIX__}/`
  }

  const component = $(
    StaticRouter,
    {
      location: {
        pathname: locals.path,
      },
    },
    // For some reason we can't pass a component prop
    // to StaticRouter like we do for BrowserRouter.
    $(Route, {
      component: location =>
        $(
          syncRequires.layouts[`index`],
          { ...location },
          $(Switch, null, [
            ...filteredPages.map(route => {
              return $(Route, {
                exact: true,
                path: route.path,
                component: props =>
                  $(syncRequires.components[route.componentChunkName], {
                    ...props,
                    ...syncRequires.json[route.jsonName],
                  }),
              })
            }),
            $(Route, {
              component: props =>
                $(syncRequires.components[noMatch.componentChunkName], {
                  ...props,
                  ...syncRequires.json[noMatch.jsonName],
                }),
            }),
          ])
        ),
    })
  )

  // Let the site or plugin render the page component.
  const results = apiRunner(
    `replaceServerBodyRender`,
    { component, headComponents: [] },
    {}
  )
  let {
    body,
    headComponents,
    postBodyComponents,
    ...bodyRenderProps
  } = results[0]

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
  const chunkManifest = require(`!raw!../public/chunk-manifest.json`)

  postBodyComponents.unshift(
    <script
      id="webpack-manifest"
      dangerouslySetInnerHTML={{
        __html: `
            //<![CDATA[
            window.webpackManifest = ${chunkManifest}
            //]]>
            `,
      }}
    />
  )

  let stats
  try {
    stats = require(`../public/stats.json`)
  } catch (e) {
    // ignore
  }

  const dascripts = [
    `commons`,
    `app`,
    pathChunkName(locals.path),
    pages.find(page => page.path === locals.path).componentChunkName,
  ]
  dascripts.forEach(script => {
    const fetchKey = `assetsByChunkName[${script}][0]`
    const prefixedScript = `${linkPrefix}${get(stats, fetchKey, ``)}`

    // Add preload <link>s for scripts.
    headComponents.unshift(
      <link rel="preload" href={prefixedScript} as="script" />
    )

    // Add script tags for the bottom of the page.
    postBodyComponents.push(
      <script key={prefixedScript} src={prefixedScript} />
    )
  })

  // Call plugins to let them add to or modify components/props.
  const pluginHeadComponents = apiRunner(
    `modifyHeadComponents`,
    { headComponents },
    []
  )
  headComponents = headComponents.concat(pluginHeadComponents)

  const pluginPostBodyComponents = apiRunner(
    `modifyPostBodyComponents`,
    { postBodyComponents },
    []
  )
  postBodyComponents = postBodyComponents.concat(pluginPostBodyComponents)

  const pluginBodyRenderProps = apiRunner(
    `modifyBodyRenderProps`,
    { bodyRenderProps },
    {}
  )
  bodyRenderProps = merge(bodyRenderProps, pluginBodyRenderProps)

  const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(<Html {...bodyRenderProps} headComponents={headComponents} postBodyComponents={postBodyComponents} body={body} path={locals.path} />)}`
  callback(null, html)
}
