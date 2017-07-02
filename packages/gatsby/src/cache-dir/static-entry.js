import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { StaticRouter, Route, withRouter } from "react-router-dom"
import { kebabCase, get, merge, isArray, isString } from "lodash"
import apiRunner from "./api-runner-ssr"
import pages from "./pages.json"
import syncRequires from "./sync-requires"

let Html
try {
  Html = require(`../src/html`)
} catch (e) {
  Html = require(`./default-html`)
}

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
  layout = props =>
    <div>
      {props.children()}
    </div>
}

module.exports = (locals, callback) => {
  let pathPrefix = `/`
  if (__PREFIX_PATHS__) {
    pathPrefix = `${__PATH_PREFIX__}/`
  }

  let bodyHTML = ``
  let headComponents = []
  let preBodyComponents = []
  let postBodyComponents = []
  let bodyProps = {}

  const replaceBodyHTMLString = body => {
    bodyHTML = body
  }

  const setHeadComponents = components => {
    headComponents = headComponents.concat(components)
  }

  const setPreBodyComponents = components => {
    preBodyComponents = preBodyComponents.concat(components)
  }

  const setPostBodyComponents = components => {
    postBodyComponents = postBodyComponents.concat(components)
  }

  const setBodyProps = props => {
    bodyProps = merge({}, bodyProps, props)
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
  apiRunner(`replaceRenderer`, {
    bodyComponent,
    replaceBodyHTMLString,
    setHeadComponents,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
  })

  // If no one stepped up, we'll handle it.
  if (!bodyHTML) {
    bodyHTML = renderToString(bodyComponent)
  }

  apiRunner(`onRenderBody`, {
    setHeadComponents,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
  })

  // Add the chunk-manifest as a head component.
  const chunkManifest = require(`!raw!../public/chunk-manifest.json`)

  headComponents.unshift(
    <script
      id="webpack-manifest"
      key="webpack-manifest"
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

  // Create paths to scripts
  const scripts = [
    `commons`,
    `app`,
    `layout-component---index`,
    pathChunkName(locals.path),
    pages.find(page => page.path === locals.path).componentChunkName,
  ]
    .map(s => {
      const fetchKey = `assetsByChunkName[${s}]`

      let fetchedScript = get(stats, fetchKey)

      if (!fetchedScript) {
        return null
      }

      // If sourcemaps are enabled, then the entry will be an array with
      // the script name as the first entry.
      fetchedScript = isArray(fetchedScript) ? fetchedScript[0] : fetchedScript
      const prefixedScript = `${pathPrefix}${fetchedScript}`

      // Make sure we found a component.
      if (prefixedScript === `/`) {
        return null
      }

      return prefixedScript
    })
    .filter(s => isString(s))

  scripts.forEach(script => {
    // Add preload <link>s for scripts.
    headComponents.unshift(
      <link rel="preload" key={script} href={script} as="script" />
    )
  })

  // Add script loader for page scripts to the head.
  // Taken from https://www.html5rocks.com/en/tutorials/speed/script-loading/
  const scriptsString = scripts.map(s => `"${s}"`).join(`,`)
  headComponents.push(
    <script
      key={`script-loader`}
      dangerouslySetInnerHTML={{
        __html: `
  !function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",[
  ${scriptsString}
])
  `,
      }}
    />
  )

  const html = `<!DOCTYPE html>\n ${renderToStaticMarkup(
    <Html
      {...bodyProps}
      headComponents={headComponents}
      preBodyComponents={preBodyComponents}
      postBodyComponents={postBodyComponents}
      body={bodyHTML}
      path={locals.path}
    />
  )}`

  callback(null, html)
}
