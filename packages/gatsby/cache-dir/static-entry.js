import React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { StaticRouter, Route, withRouter } from "react-router-dom"
import { kebabCase, get, merge, isArray, isString } from "lodash"

import apiRunner from "./api-runner-ssr"
import pages from "./pages.json"
import syncRequires from "./sync-requires"
import testRequireError from "./test-require-error"

let Html
try {
  Html = require(`../src/html`)
} catch (err) {
  if (testRequireError(`..\/src\/html`, err)) {
    Html = require(`./default-html`)
  } else {
    console.log(
      `\n\nThere was an error requiring "src/html.js"\n\n`,
      err,
      `\n\n`
    )
    process.exit()
  }
}

const pathChunkName = path => {
  const name = path === `/` ? `index` : kebabCase(path)
  return `path---${name}`
}

const getPage = path => pages.find(page => page.path === path)
const defaultLayout = props => <div>{props.children()}</div>

const getLayout = page => {
  const layout = syncRequires.layouts[page.layout]
  return layout ? layout : defaultLayout
}

const createElement = React.createElement

module.exports = (locals, callback) => {
  let pathPrefix = `/`
  if (__PREFIX_PATHS__) {
    pathPrefix = `${__PATH_PREFIX__}/`
  }

  let bodyHtml = ``
  let headComponents = []
  let htmlAttributes = {}
  let bodyAttributes = {}
  let preBodyComponents = []
  let postBodyComponents = []
  let bodyProps = {}

  const replaceBodyHTMLString = body => {
    bodyHtml = body
  }

  const setHeadComponents = components => {
    headComponents = headComponents.concat(components)
  }

  const setHtmlAttributes = attributes => {
    htmlAttributes = merge(htmlAttributes, attributes)
  }

  const setBodyAttributes = attributes => {
    bodyAttributes = merge(bodyAttributes, attributes)
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

  const bodyComponent = createElement(
    StaticRouter,
    {
      location: {
        pathname: locals.path,
      },
      context: {},
    },
    createElement(Route, {
      render: routeProps => {
        const page = getPage(routeProps.location.pathname)
        const layout = getLayout(page)
        return createElement(withRouter(layout), {
          children: layoutProps => {
            const props = layoutProps ? layoutProps : routeProps
            return createElement(
              syncRequires.components[page.componentChunkName],
              {
                ...props,
                ...syncRequires.json[page.jsonName],
              }
            )
          },
        })
      },
    })
  )

  // Let the site or plugin render the page component.
  apiRunner(`replaceRenderer`, {
    bodyComponent,
    replaceBodyHTMLString,
    setHeadComponents,
    setHtmlAttributes,
    setBodyAttributes,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
  })

  // If no one stepped up, we'll handle it.
  if (!bodyHtml) {
    bodyHtml = renderToString(bodyComponent)
  }

  apiRunner(`onRenderBody`, {
    setHeadComponents,
    setHtmlAttributes,
    setBodyAttributes,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
    pathname: locals.path,
    bodyHtml,
  })

  let stats
  try {
    stats = require(`../public/stats.json`)
  } catch (e) {
    // ignore
  }

  // Create paths to scripts
  const page = pages.find(page => page.path === locals.path)
  const scripts = [
    `commons`,
    `app`,
    pathChunkName(locals.path),
    page.componentChunkName,
    page.layoutComponentChunkName,
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

  // Add the chunk-manifest at the end of body element.
  const chunkManifest = require(`!raw!../public/chunk-manifest.json`)
  postBodyComponents.unshift(
    <script
      id="webpack-manifest"
      key="webpack-manifest"
      dangerouslySetInnerHTML={{
        __html: `/*<![CDATA[*/window.webpackManifest=${chunkManifest}/*]]>*/`,
      }}
    />
  )

  // Add script loader for page scripts to the end of body element (after webpack manifest).
  // Taken from https://www.html5rocks.com/en/tutorials/speed/script-loading/
  const scriptsString = scripts.map(s => `"${s}"`).join(`,`)
  postBodyComponents.push(
    <script
      key={`script-loader`}
      dangerouslySetInnerHTML={{
        __html: `/*<![CDATA[*/!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",[${scriptsString}])/*]]>*/`,
      }}
    />
  )

  const html = `<!DOCTYPE html>${renderToStaticMarkup(
    <Html
      {...bodyProps}
      headComponents={headComponents}
      htmlAttributes={htmlAttributes}
      bodyAttributes={bodyAttributes}
      preBodyComponents={preBodyComponents}
      postBodyComponents={postBodyComponents}
      body={bodyHtml}
      path={locals.path}
    />
  )}`

  callback(null, html)
}
