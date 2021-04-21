import React from "react"
import fs from "fs"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { get, merge, isObject, flatten, uniqBy, concat } from "lodash"
import nodePath from "path"
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

let cachedStats
const getStats = publicDir => {
  if (cachedStats) {
    return cachedStats
  } else {
    cachedStats = JSON.parse(
      fs.readFileSync(nodePath.join(publicDir, `webpack.stats.json`), `utf-8`)
    )

    return cachedStats
  }
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

export default (pagePath, isClientOnlyPage, publicDir, callback) => {
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
      return nodePath.join(`page-data`, fixedPagePath, `page-data.json`)
    }

    const getPageData = pagePath => {
      const pageDataPath = getPageDataPath(pagePath)
      const absolutePageDataPath = nodePath.join(publicDir, pageDataPath)
      const pageDataJson = fs.readFileSync(absolutePageDataPath, `utf8`)

      try {
        return JSON.parse(pageDataJson)
      } catch (err) {
        return null
      }
    }

    const pageData = getPageData(pagePath)

    const { componentChunkName, staticQueryHashes = [] } = pageData

    let scriptsAndStyles = flatten(
      [`commons`].map(chunkKey => {
        const fetchKey = `assetsByChunkName[${chunkKey}]`

        const stats = getStats(publicDir)
        let chunks = get(stats, fetchKey)
        const namedChunkGroups = get(stats, `namedChunkGroups`)

        if (!chunks) {
          return null
        }

        chunks = chunks.map(chunk => {
          if (chunk === `/`) {
            return null
          }
          return { rel: `preload`, name: chunk }
        })

        namedChunkGroups[chunkKey].assets.forEach(asset =>
          chunks.push({ rel: `preload`, name: asset.name })
        )

        const childAssets = namedChunkGroups[chunkKey].childAssets
        for (const rel in childAssets) {
          if (childAssets.hasownProperty(rel)) {
            chunks = concat(
              chunks,
              childAssets[rel].map(chunk => {
                return { rel, name: chunk }
              })
            )
          }
        }

        return chunks
      })
    )
      .filter(s => isObject(s))
      .sort((s1, s2) => (s1.rel == `preload` ? -1 : 1)) // given priority to preload

    scriptsAndStyles = uniqBy(scriptsAndStyles, item => item.name)

    const styles = scriptsAndStyles.filter(
      style => style.name && style.name.endsWith(`.css`)
    )

    styles
      .slice(0)
      .reverse()
      .forEach(style => {
        headComponents.unshift(
          <link
            data-identity={`gatsby-dev-css`}
            key={style.name}
            rel="stylesheet"
            type="text/css"
            href={`${__PATH_PREFIX__}/${style.name}`}
          />
        )
      })

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
        }

        let pageElement
        if (
          syncRequires.ssrComponents[componentChunkName] &&
          !isClientOnlyPage
        ) {
          pageElement = createElement(
            syncRequires.ssrComponents[componentChunkName],
            props
          )
        } else {
          // If this is a client-only page or the pageComponent didn't finish
          // compiling yet, just render an empty component.
          pageElement = () => null
        }

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

  const bodyStr = generateBodyHTML()

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
      <script key={`framework`} src="/framework.js" />,
      <script key={`commons`} src="/commons.js" />,
    ]),
  })
  let htmlStr = renderToStaticMarkup(htmlElement)
  htmlStr = `<!DOCTYPE html>${htmlStr}`

  callback(null, htmlStr)
}
