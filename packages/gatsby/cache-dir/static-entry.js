/* global HAS_REACT_18 */
const React = require(`react`)
const path = require(`path`)
const {
  renderToString,
  renderToStaticMarkup,
  renderToPipeableStream,
} = require(`react-dom/server`)
const { ServerLocation, Router, isRedirect } = require(`@gatsbyjs/reach-router`)
const merge = require(`deepmerge`)
const {
  StaticQueryContext,
  SlicesContext,
  SlicesMapContext,
  SlicesPropsContext,
} = require(`gatsby`)
const fs = require(`fs`)
const { WritableAsPromise } = require(`./server-utils/writable-as-promise`)

const { RouteAnnouncerProps } = require(`./route-announcer-props`)
const { apiRunner, apiRunnerAsync } = require(`./api-runner-ssr`)
const asyncRequires = require(`$virtual/async-requires`)
const { version: gatsbyVersion } = require(`gatsby/package.json`)
const { grabMatchParams } = require(`./find-path`)
const { headHandlerForSSR } = require(`./head/head-export-handler-for-ssr`)
const { SlicesResultsContext } = require(`./slice`)
const { ServerSliceRenderer } = require(`./slice/server-slice-renderer`)

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
  const componentsArray = [].concat(components).flat(Infinity).filter(Boolean)

  return componentsArray.map(component => {
    // Ensure manifest is always loaded from content server
    // And not asset server when an assetPrefix is used
    if (__ASSET_PREFIX__ && component.props.rel === `manifest`) {
      return React.cloneElement(component, {
        href: component.props.href.replace(__ASSET_PREFIX__, ``),
      })
    }
    return component
  })
}

function deepMerge(a, b) {
  const combineMerge = (target, source, options) => {
    const destination = target.slice()

    source.forEach((item, index) => {
      if (typeof destination[index] === `undefined`) {
        destination[index] = options.cloneUnlessOtherwiseSpecified(
          item,
          options
        )
      } else if (options.isMergeableObject(item)) {
        destination[index] = merge(target[index], item, options)
      } else if (target.indexOf(item) === -1) {
        destination.push(item)
      }
    })
    return destination
  }

  return merge(a, b, { arrayMerge: combineMerge })
}

/**
Reorder headComponents so meta tags are always at the top and aren't missed by crawlers by being pushed down by large inline styles, etc.
@see https://github.com/gatsbyjs/gatsby/issues/22206
*/
export const reorderHeadComponents = headComponents => {
  const sorted = headComponents.sort((a, b) => {
    if (a.type && a.type === `meta` && !(b.type && b.type === `meta`)) {
      return -1
    }
    return 0
  })

  return sorted
}

const DEFAULT_CONTEXT = {
  // whether or not we're building the site now
  // usage in determining original build or engines
  isDuringBuild: false,
}

export default async function staticPage({
  pagePath,
  pageData,
  staticQueryContext,
  styles,
  scripts,
  reversedStyles,
  reversedScripts,
  inlinePageData = false,
  context = {},
  sliceData,
}) {
  const renderContext = Object.assign(DEFAULT_CONTEXT, context)

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
      // TODO - we should remove deep merges
      htmlAttributes = deepMerge(htmlAttributes, attributes)
    }

    const setBodyAttributes = attributes => {
      // TODO - we should remove deep merges
      bodyAttributes = deepMerge(bodyAttributes, attributes)
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
      // TODO - we should remove deep merges
      bodyProps = deepMerge({}, bodyProps, props)
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

    const { componentChunkName, slicesMap } = pageData
    const pageComponent = await asyncRequires.components[componentChunkName]()

    headHandlerForSSR({
      pageComponent,
      setHeadComponents,
      staticQueryContext,
      pageData,
      pagePath,
    })

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

        const pageElement = createElement(pageComponent.default, props)

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

    const sliceProps = {}
    // const sliceResults = getSliceResults()

    const slicesContext = {
      // if we're in build now, we know we're on the server
      // otherwise we're in an engine
      renderEnvironment: renderContext.isDuringBuild ? `server` : `engines`,
    }

    let body = apiRunner(
      `wrapRootElement`,
      { element: routerElement, pathname: pagePath },
      routerElement,
      ({ result }) => {
        return { element: result, pathname: pagePath }
      }
    ).pop()

    // if we're running in an engine, we need to manually wrap body with
    // the results context to pass the map of slice name to component/data/context
    if (slicesContext.renderEnvironment === `engines`) {
      // this is the same name used in the browser
      // since this immitates behavior
      const slicesDb = new Map()

      for (const sliceName of Object.values(slicesMap)) {
        const slice = sliceData[sliceName]
        const { default: SliceComponent } = await getPageChunk(slice)

        const sliceObject = {
          component: SliceComponent,
          sliceContext: slice.result.sliceContext,
          data: slice.result.data,
        }

        slicesDb.set(sliceName, sliceObject)
      }

      body = (
        <SlicesResultsContext.Provider value={slicesDb}>
          {body}
        </SlicesResultsContext.Provider>
      )
    }

    // TODO sc-53539: lol this nested context should be addressed
    const bodyComponent = (
      <StaticQueryContext.Provider value={staticQueryContext}>
        <SlicesContext.Provider value={slicesContext}>
          <SlicesPropsContext.Provider value={sliceProps}>
            <SlicesMapContext.Provider value={slicesMap}>
              {body}
            </SlicesMapContext.Provider>
          </SlicesPropsContext.Provider>
        </SlicesContext.Provider>
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
        if (HAS_REACT_18) {
          const writableStream = new WritableAsPromise()
          const { pipe } = renderToPipeableStream(bodyComponent, {
            onAllReady() {
              pipe(writableStream)
            },
            onError(error) {
              writableStream.destroy(error)
            },
          })

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
      // Add preload/prefetch <link>s magic comments
      if (script.shouldGenerateLink) {
        headComponents.push(
          <link
            as="script"
            rel={script.rel}
            key={script.name}
            href={`${__PATH_PREFIX__}/${script.name}`}
          />
        )
      }
    })

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
    const windowPageData = `/*<![CDATA[*/window.pagePath="${pagePath}";${
      inlinePageData ? `window.pageData=${JSON.stringify(pageData)};` : ``
    }/*]]>*/`

    postBodyComponents.push(
      <script
        key={`script-loader`}
        id={`gatsby-script-loader`}
        dangerouslySetInnerHTML={{
          __html: windowPageData,
        }}
      />
    )

    postBodyComponents.push(
      createElement(ServerSliceRenderer, {
        sliceId: `_gatsby-scripts`,
      })
    )

    headComponents = reorderHeadComponents(headComponents)

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

    return {
      html,
      unsafeBuiltinsUsage: global.unsafeBuiltinUsage,
      sliceData: sliceProps,
    }
  } catch (e) {
    e.unsafeBuiltinsUsage = global.unsafeBuiltinUsage
    throw e
  }
}

export function getPageChunk({ componentChunkName }) {
  return asyncRequires.components[componentChunkName]()
}

export async function renderSlice({ slice, staticQueryContext, props = {} }) {
  const { default: SliceComponent } = await getPageChunk(slice)

  const sliceElement = (
    <StaticQueryContext.Provider value={staticQueryContext}>
      <SliceComponent sliceContext={slice.context} {...props} />
    </StaticQueryContext.Provider>
  )

  if (HAS_REACT_18) {
    const writableStream = new WritableAsPromise()
    const { pipe } = renderToPipeableStream(sliceElement, {
      onAllReady() {
        pipe(writableStream)
      },
      onError(e) {
        throw e
      },
    })

    return await writableStream
  } else {
    return renderToString(sliceElement)
  }
}
