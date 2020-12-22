import React from "react"
import fs from "fs"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { merge } from "lodash"
import { join } from "path"
import apiRunner from "./api-runner-ssr"
import { grabMatchParams } from "./find-path"
import syncRequires from "$virtual/ssr-sync-requires"

import { RouteAnnouncerProps } from "./route-announcer-props"
import { ServerLocation, Router, isRedirect } from "@reach/router"

// import testRequireError from "./test-require-error"
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
    console.log(`There was an error requiring "src/html.js"\n\n`, err, `\n\n`)
    process.exit()
  }
}

Html = Html && Html.__esModule ? Html.default : Html

export default (pagePath, isClientOnlyPage, callback) => {
  let bodyHtml = ``
  let headComponents = [
    <meta key="environment" name="note" content="environment=development" />,
  ]
  let htmlAttributes = {}
  let bodyAttributes = {}
  let preBodyComponents = []
  let postBodyComponents = []
  let bodyProps = {}

  const generateBodyHTML = () => {
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

    const replaceBodyHTMLString = body => {
      bodyHtml = body
    }

    const getPreBodyComponents = () => preBodyComponents

    const replacePreBodyComponents = components => {
      preBodyComponents = components
    }

    const getPostBodyComponents = () => postBodyComponents

    const replacePostBodyComponents = components => {
      postBodyComponents = components
    }

    const getPageDataPath = path => {
      const fixedPagePath = path === `/` ? `index` : path
      return join(`page-data`, fixedPagePath, `page-data.json`)
    }

    const getPageData = pagePath => {
      const pageDataPath = getPageDataPath(pagePath)
      const absolutePageDataPath = join(process.cwd(), `public`, pageDataPath)
      const pageDataJson = fs.readFileSync(absolutePageDataPath, `utf8`)

      try {
        return JSON.parse(pageDataJson)
      } catch (err) {
        return null
      }
    }

    const pageData = getPageData(pagePath)

    const componentChunkName = pageData?.componentChunkName

    const createElement = React.createElement

    class RouteHandler extends React.Component {
      render() {
        const props = {
          ...this.props,
          ...pageData.result,
          params: {
            ...grabMatchParams(this.props.location.pathname),
            ...(pageData.result?.pageContext?.__params || {}),
          },
          // pathContext was deprecated in v2. Renamed to pageContext
          pathContext: pageData.result
            ? pageData.result.pageContext
            : undefined,
        }

        const pageElement = createElement(
          syncRequires.ssrComponents[componentChunkName],
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

    const bodyComponent = apiRunner(
      `wrapRootElement`,
      { element: routerElement, pathname: pagePath },
      routerElement,
      ({ result }) => {
        return { element: result, pathname: pagePath }
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
      pathname: pagePath,
      pathPrefix: __PATH_PREFIX__,
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

    apiRunner(`onRenderBody`, {
      setHeadComponents,
      setHtmlAttributes,
      setBodyAttributes,
      setPreBodyComponents,
      setPostBodyComponents,
      setBodyProps,
      pathname: pagePath,
    })

    apiRunner(`onPreRenderHTML`, {
      getHeadComponents,
      replaceHeadComponents,
      getPreBodyComponents,
      replacePreBodyComponents,
      getPostBodyComponents,
      replacePostBodyComponents,
      pathname: pagePath,
    })

    return bodyHtml
  }

  const bodyStr = isClientOnlyPage ? `` : generateBodyHTML()

  const htmlElement = React.createElement(Html, {
    ...bodyProps,
    body: bodyStr,
    headComponents: headComponents.concat([
      <script key={`io`} src="/socket.io/socket.io.js" />,
    ]),
    htmlAttributes,
    bodyAttributes,
    preBodyComponents,
    postBodyComponents: postBodyComponents.concat([
      <script key={`polyfill`} src="/polyfill.js" noModule={true} />,
      <script key={`commons`} src="/commons.js" />,
    ]),
  })
  let htmlStr = renderToStaticMarkup(htmlElement)
  htmlStr = `<!DOCTYPE html>${htmlStr}`

  callback(null, htmlStr)
}
