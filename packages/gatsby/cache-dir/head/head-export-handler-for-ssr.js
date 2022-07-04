const React = require(`react`)
const { grabMatchParams } = require(`../find-path`)
const { createElement } = require(`react`)
const { StaticQueryContext } = require(`gatsby`)
const {
  headExportValidator,
  filterHeadProps,
  warnForInvalidTags,
} = require(`./utils`)
const { ServerLocation, Router } = require(`@gatsbyjs/reach-router`)
const { renderToString } = require(`react-dom/server`)
const { parse } = require(`node-html-parser`)
const { VALID_NODE_NAMES } = require(`./constants`)

function headHandlerForSSR({
  pageComponent,
  setHeadComponents,
  staticQueryContext,
  pageData,
  pagePath,
}) {
  if (pageComponent.head) {
    headExportValidator(pageComponent.head)

    function HeadRouteHandler(props) {
      const _props = {
        ...props,
        ...pageData.result,
        params: {
          ...grabMatchParams(props.location.pathname),
          ...(pageData.result?.pageContext?.__params || {}),
        },
      }

      return createElement(pageComponent.head, filterHeadProps(_props))
    }

    const routerElement = (
      <StaticQueryContext.Provider value={staticQueryContext}>
        <ServerLocation url={`${__BASE_PATH__}${pagePath}`}>
          <Router baseuri={__BASE_PATH__} component={React.Fragment}>
            <HeadRouteHandler path="/*" />
          </Router>
        </ServerLocation>
      </StaticQueryContext.Provider>
    )

    // extract head nodes from string
    const rawString = renderToString(routerElement)
    const headNodes = parse(rawString).childNodes

    const validHeadNodes = []

    for (const node of headNodes) {
      const { rawTagName, attributes } = node

      if (!VALID_NODE_NAMES.includes(rawTagName)) {
        warnForInvalidTags(rawTagName)
      } else {
        const element = createElement(
          rawTagName,
          {
            ...attributes,
            "data-gatsby-head": true,
          },
          node.childNodes[0]?.textContent
        )

        validHeadNodes.push(element)
      }
    }

    setHeadComponents(validHeadNodes)
  }
}

module.exports = {
  headHandlerForSSR,
}
