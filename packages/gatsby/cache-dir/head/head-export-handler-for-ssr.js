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

      return createElement(pageComponent.Head, filterHeadProps(_props))
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

    // extract head nodes from string
    const rawString = renderToString(routerElement)
    const headNodes = parse(rawString).childNodes

    const validHeadNodes = []

    const seenIds = new Map()
    for (const node of headNodes) {
      const { rawTagName } = node
      const id = node.attributes?.id

      if (!VALID_NODE_NAMES.includes(rawTagName)) {
        warnForInvalidTags(rawTagName)
      } else {
        let element
        const attributes = { ...node.attributes, "data-gatsby-head": true }
        if (rawTagName === `script`) {
          element = (
            <script
              {...attributes}
              dangerouslySetInnerHTML={{
                __html: node.text,
              }}
            />
          )
        } else {
          element =
            node.textContent.length > 0 ? (
              <node.rawTagName {...attributes}>
                {node.textContent}
              </node.rawTagName>
            ) : (
              <node.rawTagName {...attributes} />
            )
        }

        if (id) {
          if (!seenIds.has(id)) {
            validHeadNodes.push(element)
            seenIds.set(id, validHeadNodes.length - 1)
          } else {
            const indexOfPreviouslyInsertedNode = seenIds.get(id)
            validHeadNodes[indexOfPreviouslyInsertedNode] = element
          }
        } else {
          validHeadNodes.push(element)
        }
      }
    }

    setHeadComponents(validHeadNodes)
  }
}
