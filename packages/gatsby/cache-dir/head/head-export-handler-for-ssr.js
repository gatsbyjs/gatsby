const React = require(`react`)
const { grabMatchParams } = require(`../find-path`)
const { StaticQueryContext } = require(`gatsby`)
const {
  headExportValidator,
  filterHeadProps,
  getValidHeadNodeForSSR,
} = require(`./utils`)
const { ServerLocation, Router } = require(`@gatsbyjs/reach-router`)
const { renderToString } = require(`react-dom/server`)
const { parse } = require(`node-html-parser`)
import { apiRunner } from "../api-runner-browser"

export function headHandlerForSSR({
  pageComponent,
  setHeadComponents,
  staticQueryContext,
  pageData,
  pagePath,
}) {
  if (pageComponent?.Head) {
    headExportValidator(pageComponent.Head)

    function HeadRouteHandler(props) {
      const _props = {
        ...props,
        ...pageData.result,
        params: {
          ...grabMatchParams(props.location.pathname),
          ...(pageData.result?.pageContext?.__params || {}),
        },
      }

      const HeadElement = () => (
        <pageComponent.Head {...filterHeadProps(_props)} />
      )

      const headWithWrapRootElement = apiRunner(
        `wrapRootElement`,
        { element: <HeadElement /> },
        <HeadElement />,
        ({ result }) => {
          return { element: result }
        }
      ).pop()

      return headWithWrapRootElement
    }

    const routerElement = (
      <StaticQueryContext.Provider value={staticQueryContext}>
        <ServerLocation url={`${__BASE_PATH__}${pagePath}`}>
          <Router
            baseuri={__BASE_PATH__}
            component={({ children }) => <>{children}</>}
          >
            <HeadRouteHandler path="/*" />
          </Router>
        </ServerLocation>
      </StaticQueryContext.Provider>
    )

    const rawString = renderToString(routerElement)
    const rootNode = parse(rawString)
    const validHeadNodes = getValidHeadNodeForSSR(rootNode)

    setHeadComponents(validHeadNodes)
  }
}
