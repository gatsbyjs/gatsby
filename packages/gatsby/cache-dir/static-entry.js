const React = require(`react`)
const fs = require(`fs`)
const { join } = require(`path`)
const { renderToString, renderToStaticMarkup } = require(`react-dom/server`)
const { StaticRouter, Route, withRouter } = require(`react-router-dom`)
const { kebabCase, get, merge, isString, flatten } = require(`lodash`)

const apiRunner = require(`./api-runner-ssr`)
const pages = require(`./pages.json`)
const syncRequires = require(`./sync-requires`)

const stats = JSON.parse(
  fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`)
)

// const testRequireError = require("./test-require-error")
// For some extremely mysterious reason, webpack adds the above module *after*
// this module so that when this code runs, testRequireError is undefined.
// So in the meantime, we'll just inline it.
const testRequireError = (moduleName, err) => {
  const regex = new RegExp(`Error: Cannot find module\\s.${moduleName}`)
  const firstLine = err.toString().split(`\n`)[0]
  return regex.test(firstLine)
}

let Html
try {
  Html = require(`../src/html`)
} catch (err) {
  if (testRequireError(`../src/html`, err)) {
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

Html = Html && Html.__esModule ? Html.default : Html

function urlJoin(...parts) {
  return parts.reduce((r, next) => {
    const segment = next == null ? `` : String(next).replace(/^\/+/, ``)
    return segment ? `${r.replace(/\/$/, ``)}/${segment}` : r
  }, ``)
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

export default (locals, callback) => {
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

  const AltStaticRouter = apiRunner(`replaceStaticRouterComponent`)[0]

  apiRunner(`replaceStaticRouterComponent`)

  const bodyComponent = createElement(
    AltStaticRouter || StaticRouter,
    {
      basename: pathPrefix,
      location: {
        pathname: locals.path,
      },
      context: {},
    },
    createElement(Route, {
      // eslint-disable-next-line react/display-name
      render: routeProps => {
        const page = getPage(routeProps.location.pathname)
        const layout = getLayout(page)
        return createElement(withRouter(layout), {
          // eslint-disable-next-line react/display-name
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

  // Create paths to scripts
  const page = pages.find(page => page.path === locals.path)
  let runtimeScript
  const scriptsAndStyles = flatten(
    [
      `app`,
      pathChunkName(locals.path),
      page.layoutComponentChunkName,
      page.componentChunkName,
    ].map(s => {
      const fetchKey = `assetsByChunkName[${s}]`

      let chunks = get(stats, fetchKey)

      // Remove the runtime as we always inline that instead
      // of loading it.
      if (s === `app`) {
        runtimeScript = chunks[0]
      }

      if (!chunks) {
        return null
      }

      return chunks.map(chunk => {
        if (chunk === `/`) {
          return null
        }
        if (chunk.slice(0, 15) === `webpack-runtime`) {
          return null
        }
        return chunk
      })
    })
  ).filter(s => isString(s))
  const scripts = scriptsAndStyles.filter(s => s.endsWith(`.js`))
  const styles = scriptsAndStyles.filter(s => s.endsWith(`.css`))

  const runtimeRaw = fs.readFileSync(
    join(process.cwd(), `public`, runtimeScript),
    `utf-8`
  )
  postBodyComponents.push(
    <script
      key={`webpack-runtime`}
      id={`webpack-runtime`}
      dangerouslySetInnerHTML={{
        __html: runtimeRaw,
      }}
    />
  )

  scripts
    .slice(0)
    .reverse()
    .forEach(script => {
      // Add preload <link>s for scripts.
      headComponents.unshift(
        <link
          as="script"
          rel="preload"
          key={script}
          href={urlJoin(pathPrefix, script)}
        />
      )
    })

  styles
    .slice(0)
    .reverse()
    .forEach(style => {
      // Add <link>s for styles.
      headComponents.unshift(
        <style
          type="text/css"
          data-href={urlJoin(pathPrefix, style)}
          dangerouslySetInnerHTML={{
            __html: fs.readFileSync(
              join(process.cwd(), `public`, style),
              `utf-8`
            ),
          }}
        />
      )
    })

  // Add script loader for page scripts to the end of body element (after webpack manifest).
  // Taken from https://www.html5rocks.com/en/tutorials/speed/script-loading/
  const scriptsString = scripts.map(s => JSON.stringify(s)).join(`,`)
  postBodyComponents.push(
    <script
      key={`script-loader`}
      id={`gatsby-script-loader`}
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
