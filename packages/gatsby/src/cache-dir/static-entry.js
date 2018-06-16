const React = require(`react`)
const fs = require(`fs`)
const { join } = require(`path`)
const { renderToString, renderToStaticMarkup } = require(`react-dom/server`)
const { StaticRouter, Route } = require(`react-router-dom`)
const { get, merge, isObject, flatten, uniqBy } = require(`lodash`)

const apiRunner = require(`./api-runner-ssr`)
const syncRequires = require(`./sync-requires`)
const { dataPaths, pages } = require(`./data.json`)

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

const getPage = path => pages.find(page => page.path === path)

const createElement = React.createElement

export default (pagePath, callback) => {
  const pathPrefix = `${__PATH_PREFIX__}/`

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

  const page = getPage(pagePath)

  let dataAndContext = {}
  if (page.jsonName in dataPaths) {
    const pathToJsonData = `../public/` + dataPaths[page.jsonName]
    try {
      dataAndContext = JSON.parse(
        fs.readFileSync(
          `${process.cwd()}/public/static/d/${dataPaths[page.jsonName]}.json`
        )
      )
    } catch (e) {
      console.log(`error`, pathToJsonData, e)
      process.exit()
    }
  }

  const AltStaticRouter = apiRunner(`replaceStaticRouterComponent`)[0]

  apiRunner(`replaceStaticRouterComponent`)

  const bodyComponent = createElement(
    AltStaticRouter || StaticRouter,
    {
      basename: pathPrefix.slice(0, -1),
      location: {
        pathname: pagePath,
      },
      context: {},
    },
    createElement(Route, {
      // eslint-disable-next-line react/display-name
      render: routeProps =>
        createElement(syncRequires.components[page.componentChunkName], {
          ...routeProps,
          ...dataAndContext,
          pathContext: dataAndContext.pageContext,
        }),
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

  // Create paths to scripts
  let scriptsAndStyles = flatten(
    [`app`, page.componentChunkName].map(s => {
      const fetchKey = `assetsByChunkName[${s}]`

      let chunks = get(stats, fetchKey)
      let namedChunkGroups = get(stats, `namedChunkGroups`)

      if (!chunks) {
        return null
      }

      chunks = chunks.map(chunk => {
        if (chunk === `/`) {
          return null
        }
        return { rel: `preload`, name: chunk }
      })

      const childAssets = namedChunkGroups[s].childAssets
      for (const rel in childAssets) {
        chunks = merge(
          chunks,
          childAssets[rel].map(chunk => {
            return { rel, name: chunk }
          })
        )
      }

      return chunks
    })
  )
    .filter(s => isObject(s))
    .sort((s1, s2) => (s1.rel == `preload` ? -1 : 1)) // given priority to preload

  scriptsAndStyles = uniqBy(scriptsAndStyles, item => item.name)

  const scripts = scriptsAndStyles.filter(
    script => script.name && script.name.endsWith(`.js`)
  )
  const styles = scriptsAndStyles.filter(
    style => style.name && style.name.endsWith(`.css`)
  )

  apiRunner(`onRenderBody`, {
    setHeadComponents,
    setHtmlAttributes,
    setBodyAttributes,
    setPreBodyComponents,
    setPostBodyComponents,
    setBodyProps,
    pathname: pagePath,
    bodyHtml,
    scripts,
    styles,
    pathPrefix,
  })

  scripts
    .slice(0)
    .reverse()
    .forEach(script => {
      // Add preload/prefetch <link>s for scripts.
      headComponents.push(
        <link
          as="script"
          rel={script.rel}
          key={script.name}
          href={urlJoin(pathPrefix, script.name)}
        />
      )
    })

  if (page.jsonName in dataPaths) {
    const dataPath = `${pathPrefix}static/d/${dataPaths[page.jsonName]}.json`
    headComponents.push(
      <link
        rel="preload"
        key={dataPath}
        href={dataPath}
        as="fetch"
        crossOrigin="use-credentials"
      />
    )
  }

  styles
    .slice(0)
    .reverse()
    .forEach(style => {
      // Add <link>s for styles.
      headComponents.push(
        <link
          as="style"
          rel={style.rel}
          key={style.name}
          href={urlJoin(pathPrefix, style.name)}
        />
      )

      headComponents.unshift(
        <style
          type="text/css"
          data-href={urlJoin(pathPrefix, style.name)}
          dangerouslySetInnerHTML={{
            __html: fs.readFileSync(
              join(process.cwd(), `public`, style.name),
              `utf-8`
            ),
          }}
        />
      )
    })

  // Add page metadata for the current page
  const windowData = `/*<![CDATA[*/window.page=${JSON.stringify(page)};${
    page.jsonName in dataPaths
      ? `window.dataPath="${dataPaths[page.jsonName]}";`
      : ``
  }/*]]>*/`

  postBodyComponents.push(
    <script
      key={`script-loader`}
      id={`gatsby-script-loader`}
      dangerouslySetInnerHTML={{
        __html: windowData,
      }}
    />
  )

  // Filter out prefetched bundles as adding them as a script tag
  // would force high priority fetching.
  const bodyScripts = scripts.filter(s => s.rel !== `prefetch`).map(s => {
    const scriptPath = `${pathPrefix}${JSON.stringify(s.name).slice(1, -1)}`
    return <script key={scriptPath} src={scriptPath} async />
  })

  postBodyComponents.push(...bodyScripts)

  const html = `<!DOCTYPE html>${renderToStaticMarkup(
    <Html
      {...bodyProps}
      headComponents={headComponents}
      htmlAttributes={htmlAttributes}
      bodyAttributes={bodyAttributes}
      preBodyComponents={preBodyComponents}
      postBodyComponents={postBodyComponents}
      body={bodyHtml}
      path={pagePath}
    />
  )}`

  callback(null, html)
}
