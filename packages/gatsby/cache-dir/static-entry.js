const React = require(`react`)
const path = require(`path`)
const {
  renderToString,
  renderToStaticMarkup,
  pipeToNodeWritable,
} = require(`react-dom/server`)
const { ServerLocation, Router, isRedirect } = require(`@gatsbyjs/reach-router`)
const { merge, flattenDeep, replace } = require(`lodash`)
const { StaticQueryContext } = require(`gatsby`)
const fs = require(`fs`)

const { RouteAnnouncerProps } = require(`./route-announcer-props`)
const { apiRunner, apiRunnerAsync } = require(`./api-runner-ssr`)
const syncRequires = require(`$virtual/sync-requires`)
const { version: gatsbyVersion } = require(`gatsby/package.json`)
const { grabMatchParams } = require(`./find-path`)

const chunkMapping = require(`../public/chunk-map.json`)

// we want to force posix-style joins, so Windows doesn't produce backslashes for urls
const { join } = path.posix

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

const getPageDataPath = path => {
  const fixedPagePath = path === `/` ? `index` : path
  return join(`page-data`, fixedPagePath, `page-data.json`)
}

const getPageDataUrl = pagePath => {
  const pageDataPath = getPageDataPath(pagePath)
  return `${__PATH_PREFIX__}/${pageDataPath}`
}

const getStaticQueryPath = hash => join(`page-data`, `sq`, `d`, `${hash}.json`)

const getStaticQueryUrl = hash =>
  `${__PATH_PREFIX__}/${getStaticQueryPath(hash)}`

const getAppDataUrl = () =>
  `${__PATH_PREFIX__}/${join(`page-data`, `app-data.json`)}`

const createElement = React.createElement

export const sanitizeComponents = components => {
  const componentsArray = ensureArray(components)
  return componentsArray.map(component => {
    // Ensure manifest is always loaded from content server
    // And not asset server when an assetPrefix is used
    if (__ASSET_PREFIX__ && component.props.rel === `manifest`) {
      return React.cloneElement(component, {
        href: replace(component.props.href, __ASSET_PREFIX__, ``),
      })
    }
    return component
  })
}

const ensureArray = components => {
  if (Array.isArray(components)) {
    // remove falsy items and flatten
    return flattenDeep(
      components.filter(val => (Array.isArray(val) ? val.length > 0 : val))
    )
  } else {
    // we also accept single components, so we need to handle this case as well
    return components ? [components] : []
  }
}

export default async function staticPage({
  pagePath,
  pageData,
  staticQueryContext,
  styles,
  scripts,
  reversedStyles,
  reversedScripts,
}) {
  // for this to work we need this function to be sync or at least ensure there is single execution of it at a time
  global.unsafeBuiltinUsage = []

  try {
    let bodyHtml = ``
    let headComponents = [
      <meta
        name="generator"
        content={`Gatsby ${gatsbyVersion}`}
        key={`generator-${gatsbyVersion}`}
      />,
    ]
    let htmlAttributes = {}
    let bodyAttributes = {}
    let preBodyComponents = []
    let postBodyComponents = []
    let bodyProps = {}

    function loadPageDataSync(_pagePath) {
      if (_pagePath === pagePath) {
        // no need to use fs if we are asking for pageData of current page
        return pageData
      }

      const pageDataPath = getPageDataPath(_pagePath)
      const pageDataFile = join(process.cwd(), `public`, pageDataPath)
      try {
        // deprecation notice
        const myErrorHolder = {
          name: `Usage of loadPageDataSync for page other than currently generated page disables incremental html generation in future builds`,
        }
        Error.captureStackTrace(myErrorHolder, loadPageDataSync)
        global.unsafeBuiltinUsage.push(myErrorHolder.stack)
        const pageDataJson = fs.readFileSync(pageDataFile)
        return JSON.parse(pageDataJson)
      } catch (error) {
        // not an error if file is not found. There's just no page data
        return null
      }
    }

    const replaceBodyHTMLString = body => {
      bodyHtml = body
    }

    const setHeadComponents = components => {
      headComponents = headComponents.concat(sanitizeComponents(components))
    }

    const setHtmlAttributes = attributes => {
      htmlAttributes = merge(htmlAttributes, attributes)
    }

    const setBodyAttributes = attributes => {
      bodyAttributes = merge(bodyAttributes, attributes)
    }

    const setPreBodyComponents = components => {
      preBodyComponents = preBodyComponents.concat(
        sanitizeComponents(components)
      )
    }

    const setPostBodyComponents = components => {
      postBodyComponents = postBodyComponents.concat(
        sanitizeComponents(components)
      )
    }

    const setBodyProps = props => {
      bodyProps = merge({}, bodyProps, props)
    }

    const getHeadComponents = () => headComponents

    const replaceHeadComponents = components => {
      headComponents = sanitizeComponents(components)
    }

    const getPreBodyComponents = () => preBodyComponents

    const replacePreBodyComponents = components => {
      preBodyComponents = sanitizeComponents(components)
    }

    const getPostBodyComponents = () => postBodyComponents

    const replacePostBodyComponents = components => {
      postBodyComponents = sanitizeComponents(components)
    }

    const pageDataUrl = getPageDataUrl(pagePath)

    const { componentChunkName, staticQueryHashes = [] } = pageData

    const staticQueryUrls = staticQueryHashes.map(getStaticQueryUrl)

    class RouteHandler extends React.Component {
      render() {
        const props = {
          ...this.props,
          ...pageData.result,
          params: {
            ...grabMatchParams(this.props.location.pathname),
            ...(pageData.result?.pageContext?.__params || {}),
          },
        }

        const pageElement = createElement(
          syncRequires.components[componentChunkName],
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

    const routerElement = (
      <ServerLocation url={`${__BASE_PATH__}${pagePath}`}>
        <Router id="gatsby-focus-wrapper" baseuri={__BASE_PATH__}>
          <RouteHandler path="/*" />
        </Router>
        <div {...RouteAnnouncerProps} />
      </ServerLocation>
    )

    const bodyComponent = (
      <StaticQueryContext.Provider value={staticQueryContext}>
        {apiRunner(
          `wrapRootElement`,
          { element: routerElement, pathname: pagePath },
          routerElement,
          ({ result }) => {
            return { element: result, pathname: pagePath }
          }
        ).pop()}
      </StaticQueryContext.Provider>
    )

    // Let the site or plugin render the page component.
    await apiRunnerAsync(`replaceRenderer`, {
      bodyComponent,
      replaceBodyHTMLString,
      setHeadComponents,
      setHtmlAttributes,
      setBodyAttributes,
      setPreBodyComponents,
      setPostBodyComponents,
      setBodyProps,
      pathname: pagePath,
      pathPrefix: __PATH_PREFIX__,
    })

    // If no one stepped up, we'll handle it.
    if (!bodyHtml) {
      try {
        // react 18 enabled
        if (pipeToNodeWritable) {
          const {
            WritableAsPromise,
          } = require(`./server-utils/writable-as-promise`)
          const writableStream = new WritableAsPromise()
          const { startWriting } = pipeToNodeWritable(
            bodyComponent,
            writableStream,
            {
              onCompleteAll() {
                startWriting()
              },
              onError() {},
            }
          )

          bodyHtml = await writableStream
        } else {
          bodyHtml = renderToString(bodyComponent)
        }
      } catch (e) {
        // ignore @reach/router redirect errors
        if (!isRedirect(e)) throw e
      }
    }

    apiRunner(`onRenderBody`, {
      setHeadComponents,
      setHtmlAttributes,
      setBodyAttributes,
      setPreBodyComponents,
      setPostBodyComponents,
      setBodyProps,
      pathname: pagePath,
      loadPageDataSync,
      bodyHtml,
      scripts,
      styles,
      pathPrefix: __PATH_PREFIX__,
    })

    reversedScripts.forEach(script => {
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

    if (pageData) {
      headComponents.push(
        <link
          as="fetch"
          rel="preload"
          key={pageDataUrl}
          href={pageDataUrl}
          crossOrigin="anonymous"
        />
      )
    }
    staticQueryUrls.forEach(staticQueryUrl =>
      headComponents.push(
        <link
          as="fetch"
          rel="preload"
          key={staticQueryUrl}
          href={staticQueryUrl}
          crossOrigin="anonymous"
        />
      )
    )

    const appDataUrl = getAppDataUrl()
    if (appDataUrl) {
      headComponents.push(
        <link
          as="fetch"
          rel="preload"
          key={appDataUrl}
          href={appDataUrl}
          crossOrigin="anonymous"
        />
      )
    }

    reversedStyles.forEach(style => {
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
            data-identity={`gatsby-global-css`}
            dangerouslySetInnerHTML={{
              __html: style.content,
            }}
          />
        )
      }
    })

    // Add page metadata for the current page
    const windowPageData = `/*<![CDATA[*/window.pagePath="${pagePath}";/*]]>*/`

    postBodyComponents.push(
      <script
        key={`script-loader`}
        id={`gatsby-script-loader`}
        dangerouslySetInnerHTML={{
          __html: windowPageData,
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

    let bodyScripts = []
    if (chunkMapping[`polyfill`]) {
      chunkMapping[`polyfill`].forEach(script => {
        const scriptPath = `${__PATH_PREFIX__}${script}`
        bodyScripts.push(
          <script key={scriptPath} src={scriptPath} noModule={true} />
        )
      })
    }

    // Filter out prefetched bundles as adding them as a script tag
    // would force high priority fetching.
    bodyScripts = bodyScripts.concat(
      scripts
        .filter(s => s.rel !== `prefetch`)
        .map(s => {
          const scriptPath = `${__PATH_PREFIX__}/${JSON.stringify(s.name).slice(
            1,
            -1
          )}`
          return <script key={scriptPath} src={scriptPath} async />
        })
    )

    postBodyComponents.push(...bodyScripts)

    apiRunner(`onPreRenderHTML`, {
      getHeadComponents,
      replaceHeadComponents,
      getPreBodyComponents,
      replacePreBodyComponents,
      getPostBodyComponents,
      replacePostBodyComponents,
      pathname: pagePath,
      pathPrefix: __PATH_PREFIX__,
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

    return { html, unsafeBuiltinsUsage: global.unsafeBuiltinUsage }
  } catch (e) {
    e.unsafeBuiltinsUsage = global.unsafeBuiltinUsage
    throw e
  }
}
