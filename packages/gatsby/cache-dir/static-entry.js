const React = require(`react`)
const fs = require(`fs`)
const { join } = require(`path`)
const { renderToString, renderToStaticMarkup } = require(`react-dom/server`)
const { ServerLocation, Router, isRedirect } = require(`@reach/router`)
const { get, merge, isObject, flatten, uniqBy } = require(`lodash`)

const apiRunner = require(`./api-runner-ssr`)
const syncRequires = require(`./sync-requires`)
const { dataPaths, pages } = require(`./data.json`)
const { version: gatsbyVersion } = require(`gatsby/package.json`)

// Speed up looking up pages.
const pagesObjectMap = new Map()
pages.forEach(p => pagesObjectMap.set(p.path, p))

const stats = JSON.parse(
  fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`)
)

const chunkMapping = JSON.parse(
  fs.readFileSync(`${process.cwd()}/public/chunk-map.json`, `utf-8`)
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
    throw err
  }
}

Html = Html && Html.__esModule ? Html.default : Html

const getPage = path => pagesObjectMap.get(path)

const createElement = React.createElement

export default (pagePath, callback) => {
  let bodyHtml = ``
  let headComponents = [
    <meta name="generator" content={`Gatsby ${gatsbyVersion}`} />
  ]
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

  const getHeadComponents = () => headComponents

  const replaceHeadComponents = components => {
    headComponents = components
  }

  const getPreBodyComponents = () => preBodyComponents

  const replacePreBodyComponents = components => {
    preBodyComponents = components
  }

  const getPostBodyComponents = () => postBodyComponents

  const replacePostBodyComponents = components => {
    postBodyComponents = components
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

  class RouteHandler extends React.Component {
    render() {
      const props = {
        ...this.props,
        ...dataAndContext,
        pathContext: dataAndContext.pageContext,
      }

      const pageElement = createElement(
        syncRequires.components[page.componentChunkName],
        props
      )

      const wrappedPage = apiRunner(
        `wrapPageElement`,
        { element: pageElement, props },
        pageElement,
        ({ result }) => {
          return { element: result, props }
        }
      ).pop()

      return wrappedPage
    }
  }

  const routerElement = createElement(
    ServerLocation,
    { url: `${__PATH_PREFIX__}${pagePath}` },
    createElement(
      Router,
      {
        baseuri: `${__PATH_PREFIX__}`,
      },
      createElement(RouteHandler, { path: `/*` })
    )
  )

  const bodyComponent = apiRunner(
    `wrapRootElement`,
    { element: routerElement },
    routerElement,
    ({ result }) => {
      return { element: result }
    }
  ).pop()

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
    try {
      bodyHtml = renderToString(bodyComponent)
    } catch (e) {
      // ignore @reach/router redirect errors
      if (!isRedirect(e)) throw e
    }
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

      namedChunkGroups[s].assets.forEach(asset =>
        chunks.push({ rel: `preload`, name: asset })
      )

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
    pathPrefix: __PATH_PREFIX__,
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
          href={`${__PATH_PREFIX__}/${script.name}`}
        />
      )
    })

  if (page.jsonName in dataPaths) {
    const dataPath = `${__PATH_PREFIX__}/static/d/${
      dataPaths[page.jsonName]
    }.json`
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
      // Add <link>s for styles that should be prefetched
      // otherwise, inline as a <style> tag

      if (style.rel === `prefetch`) {
        headComponents.push(
          <link
            as="style"
            rel={style.rel}
            key={style.name}
            href={`${__PATH_PREFIX__}/${style.name}`}
          />
        )
      } else {
        headComponents.unshift(
          <style
            data-href={`${__PATH_PREFIX__}/${style.name}`}
            dangerouslySetInnerHTML={{
              __html: fs.readFileSync(
                join(process.cwd(), `public`, style.name),
                `utf-8`
              ),
            }}
          />
        )
      }
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

  // Add chunk mapping metadata
  const scriptChunkMapping = `/*<![CDATA[*/window.___chunkMapping=${JSON.stringify(
    chunkMapping
  )};/*]]>*/`

  postBodyComponents.push(
    <script
      key={`chunk-mapping`}
      id={`gatsby-chunk-mapping`}
      dangerouslySetInnerHTML={{
        __html: scriptChunkMapping,
      }}
    />
  )

  // Filter out prefetched bundles as adding them as a script tag
  // would force high priority fetching.
  const bodyScripts = scripts.filter(s => s.rel !== `prefetch`).map(s => {
    const scriptPath = `${__PATH_PREFIX__}/${JSON.stringify(s.name).slice(
      1,
      -1
    )}`
    return <script key={scriptPath} src={scriptPath} async />
  })

  postBodyComponents.push(...bodyScripts)

  apiRunner(`onPreRenderHTML`, {
    getHeadComponents,
    replaceHeadComponents,
    getPreBodyComponents,
    replacePreBodyComponents,
    getPostBodyComponents,
    replacePostBodyComponents,
  })

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
