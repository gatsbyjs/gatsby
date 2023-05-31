const React = require(`react`)
const { grabMatchParams } = require(`../find-path`)
const { StaticQueryContext } = require(`gatsby`)
const {
  headExportValidator,
  filterHeadProps,
  isElementType,
  isValidNodeName,
  warnForInvalidTag,
} = require(`./utils`)
const { ServerLocation, Router } = require(`@gatsbyjs/reach-router`)
const { renderToString } = require(`react-dom/server`)
const { parse } = require(`node-html-parser`)
const styleToOjbect = require(`style-to-object`)
import { apiRunner } from "../api-runner-ssr"

export function applyHtmlAndBodyAttributesSSR(
  htmlAndBodyAttributes,
  { setHtmlAttributes, setBodyAttributes }
) {
  if (!htmlAndBodyAttributes) return

  const { html, body } = htmlAndBodyAttributes

  setHtmlAttributes(html)
  setBodyAttributes(body)
}

export function getValidHeadNodesAndAttributesSSR(
  rootNode,
  htmlAndBodyAttributes = {
    html: {},
    body: {},
  }
) {
  const seenIds = new Map()
  const validHeadNodes = []

  // Filter out non-element nodes before looping since we don't care about them
  for (const node of rootNode.childNodes) {
    const { rawTagName } = node
    const id = node.attributes?.id

    if (!isElementType(node)) continue

    if (isValidNodeName(rawTagName)) {
      if (rawTagName === `html` || rawTagName === `body`) {
        const { style, ...nonStyleAttributes } = node.attributes

        htmlAndBodyAttributes[rawTagName] = {
          ...htmlAndBodyAttributes[rawTagName],
          ...nonStyleAttributes,
        }

        // Unfortunately renderToString converts inline styles to a string, so we have to convert them back to an object
        if (style) {
          htmlAndBodyAttributes[rawTagName].style = {
            ...htmlAndBodyAttributes[rawTagName]?.style,
            ...styleToOjbect(style),
          }
        }
      } else {
        let element
        const attributes = { ...node.attributes, "data-gatsby-head": true }

        if (rawTagName === `script` || rawTagName === `style`) {
          element = (
            <node.rawTagName
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
    } else {
      warnForInvalidTag(rawTagName)
    }

    if (node.childNodes.length) {
      validHeadNodes.push(
        ...getValidHeadNodesAndAttributesSSR(node, htmlAndBodyAttributes)
          .validHeadNodes
      )
    }
  }

  return { validHeadNodes, htmlAndBodyAttributes }
}

export function headHandlerForSSR({
  pageComponent,
  setHeadComponents,
  setHtmlAttributes,
  setBodyAttributes,
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

      const HeadElement = <pageComponent.Head {...filterHeadProps(_props)} />

      const headWithWrapRootElement = apiRunner(
        `wrapRootElement`,
        { element: HeadElement },
        HeadElement,
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
    const { validHeadNodes, htmlAndBodyAttributes } =
      getValidHeadNodesAndAttributesSSR(rootNode)

    applyHtmlAndBodyAttributesSSR(htmlAndBodyAttributes, {
      setHtmlAttributes,
      setBodyAttributes,
    })

    setHeadComponents(validHeadNodes)
  }
}
