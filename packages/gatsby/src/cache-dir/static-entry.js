import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { StaticRouter, Route, withRouter } from "react-router-dom"
import Html from "../src/html"
import { kebabCase, get, merge, isArray } from "lodash"
import apiRunner from "./api-runner-ssr"
import pages from "./pages.json"
import syncRequires from "./sync-requires"

const pathChunkName = path => {
  const name = path === `/` ? `index` : kebabCase(path)
  return `path---${name}`
}

const $ = React.createElement

// Use default layout if one isn't set.
let layout
if (syncRequires.layouts.index) {
  layout = syncRequires.layouts.index
} else {
  layout = props => <div>{props.children()}</div>
}

module.exports = (locals, callback) => {
  let linkPrefix = `/`
  if (__PREFIX_LINKS__) {
    linkPrefix = `${__LINK_PREFIX__}/`
  }

  const bodyComponent = $(
    StaticRouter,
    {
      location: {
        pathname: locals.path,
      },
      context: {},
    },
    $(withRouter(layout), {
      children: layoutProps =>
        $(Route, {
          children: routeProps => {
            const props = layoutProps ? layoutProps : routeProps
            const page = pages.find(
              page => page.path === props.location.pathname
            )
            return $(syncRequires.components[page.componentChunkName], {
              ...props,
              ...syncRequires.json[page.jsonName],
            })
          },
        }),
    })
  )

  // Let the site or plugin render the page component.
  const results = apiRunner(
    `replaceServerBodyRender`,
    { component: bodyComponent, headComponents: [] },
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
    body = renderToString(bodyComponent)
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
  if (!bodyRenderProps) {
    bodyRenderProps = {}
  }

  const onRenderBodyResults = apiRunner(`onRenderBody`, {
    body,
    headComponents,
    postBodyComponents,
    bodyRenderProps,
  })

  body = onRenderBodyResults.body
  headComponents = onRenderBodyResults.headComponents
  postBodyComponents = onRenderBodyResults.postBodyComponents
  bodyRenderProps = onRenderBodyResults.bodyRenderProps

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
    `layout-component---index`,
    pathChunkName(locals.path),
    pages.find(page => page.path === locals.path).componentChunkName,
  ]
  dascripts.forEach(script => {
    const fetchKey = `assetsByChunkName[${script}]`

    let fetchedScript = get(stats, fetchKey)
    // If sourcemaps are enabled, then the entry will be an array with
    // the script name as the first entry.
    fetchedScript = isArray(fetchedScript) ? fetchedScript[0] : fetchedScript
    const prefixedScript = `${linkPrefix}${fetchedScript}`

    // Make sure we found a component.
    if (prefixedScript === `/`) {
      return
    }

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
    `createHeadComponents`,
    { headComponents },
    []
  )
  headComponents = headComponents.concat(pluginHeadComponents)

  const pluginPostBodyComponents = apiRunner(
    `createPostBodyComponents`,
    { postBodyComponents },
    []
  )
  postBodyComponents = postBodyComponents.concat(pluginPostBodyComponents)

  const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(<Html {...bodyRenderProps} headComponents={headComponents} postBodyComponents={postBodyComponents} body={body} path={locals.path} />)}`
  callback(null, html)
}
