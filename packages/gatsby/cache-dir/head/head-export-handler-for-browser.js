import React from "react"
import { useEffect } from "react"
import { StaticQueryContext } from "gatsby"
import { LocationProvider } from "@gatsbyjs/reach-router"
import { reactDOMUtils } from "../react-dom-utils"
import { FireCallbackInEffect } from "./components/fire-callback-in-effect"
import {
  headExportValidator,
  filterHeadProps,
  diffNodes,
  getValidHeadNodesAndAttributes,
  removePrevHeadElements,
  applyHtmlAndBodyAttributes,
  removeHtmlAndBodyAttributes,
} from "./utils"
import { apiRunner } from "../api-runner-browser"
import styleToObject from "style-to-object"

const hiddenRoot = document.createElement(`div`)
const keysOfHtmlAndBodyAttributes = {
  html: [],
  body: [],
}
let hasRenderedHead = false
let prepassHtmlAndBodyAttributes = {
  html: {},
  body: {},
}

const onHeadRendered = () => {
  const { validHeadNodes, htmlAndBodyAttributes } =
    getValidHeadNodesAndAttributes(hiddenRoot, {
      html: { ...prepassHtmlAndBodyAttributes.html },
      body: { ...prepassHtmlAndBodyAttributes.body },
    })

  keysOfHtmlAndBodyAttributes.html = Object.keys(htmlAndBodyAttributes.html)
  keysOfHtmlAndBodyAttributes.body = Object.keys(htmlAndBodyAttributes.body)

  applyHtmlAndBodyAttributes(htmlAndBodyAttributes)

  /**
   * The rest of the code block below is a diffing mechanism to ensure that
   * the head elements aren't duplicted on every re-render.
   */
  const existingHeadElements = document.querySelectorAll(`[data-gatsby-head]`)

  if (existingHeadElements.length === 0) {
    document.head.append(...validHeadNodes)
    return
  }

  const newHeadNodes = []
  diffNodes({
    oldNodes: existingHeadElements,
    newNodes: validHeadNodes,
    onStale: node => node.parentNode.removeChild(node),
    onNew: node => newHeadNodes.push(node),
  })

  document.head.append(...newHeadNodes)
}

if (process.env.BUILD_STAGE === `develop`) {
  // sigh ... <html> and <body> elements are not valid descedents of <div> (our hidden element)
  // react-dom in dev mode will warn about this. There doesn't seem to be a way to render arbitrary
  // user Head without hitting this issue (our hidden element could be just "new Document()", but
  // this can only have 1 child, and we don't control what is being rendered so that's not an option)
  // instead we continue to render to <div>, and just silence warnings for <html> and <body> elements
  // https://github.com/facebook/react/blob/e2424f33b3ad727321fc12e75c5e94838e84c2b5/packages/react-dom-bindings/src/client/validateDOMNesting.js#L498-L520
  const originalConsoleError = console.error.bind(console)
  console.error = (...args) => {
    if (
      Array.isArray(args) &&
      args.length >= 2 &&
      args[0]?.includes?.(`validateDOMNesting(...): %s cannot appear as`) &&
      (args[1] === `<html>` || args[1] === `<body>`)
    ) {
      return undefined
    }
    return originalConsoleError(...args)
  }

  /* We set up observer to be able to regenerate <head> after react-refresh
     updates our hidden element.
  */
  const observer = new MutationObserver(onHeadRendered)
  observer.observe(hiddenRoot, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  })
}

export function headHandlerForBrowser({
  pageComponent,
  staticQueryResults,
  pageComponentProps,
}) {
  const mergeAttributes = (target, props = {}) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === `children` || key === `dangerouslySetInnerHTML`) continue
      if (key === `style`) {
        if (typeof value === `string`) {
          try {
            Object.assign(
              target.style ?? (target.style = {}),
              styleToObject(value)
            )
          } catch {
            // ignore malformed style strings
          }
        } else if (value && typeof value === `object`) {
          Object.assign(target.style ?? (target.style = {}), value)
        }
        continue
      }
      target[key] = value
    }
  }

  const withPatchedCreateElement = (fn, attributesAcc) => {
    const originalCreateElement = React.createElement
    React.createElement = (type, props, ...children) => {
      if (type === `html`) {
        mergeAttributes(attributesAcc.html, props)
        return originalCreateElement(React.Fragment, null, ...children)
      }
      if (type === `body`) {
        mergeAttributes(attributesAcc.body, props)
        return originalCreateElement(React.Fragment, null, ...children)
      }
      return originalCreateElement(type, props, ...children)
    }
    try {
      return fn()
    } finally {
      React.createElement = originalCreateElement
    }
  }

  useEffect(() => {
    const { render } = reactDOMUtils()

    if (!pageComponent?.Head) {
      if (hasRenderedHead) {
        render(null, hiddenRoot)
        hasRenderedHead = false
      }
      prepassHtmlAndBodyAttributes = { html: {}, body: {} }
      removePrevHeadElements()
      removeHtmlAndBodyAttributes(keysOfHtmlAndBodyAttributes)
      return () => {}
    }

    headExportValidator(pageComponent.Head)

    const HeadElement = (
      <pageComponent.Head {...filterHeadProps(pageComponentProps)} />
    )

    const WrapHeadElement = apiRunner(
      `wrapRootElement`,
      { element: HeadElement },
      HeadElement,
      ({ result }) => {
        return { element: result }
      }
    ).pop()

    prepassHtmlAndBodyAttributes = { html: {}, body: {} }

    withPatchedCreateElement(
      () =>
        render(
          <FireCallbackInEffect callback={onHeadRendered}>
            <StaticQueryContext.Provider value={staticQueryResults}>
              <LocationProvider>{WrapHeadElement}</LocationProvider>
            </StaticQueryContext.Provider>
          </FireCallbackInEffect>,
          hiddenRoot
        ),
      prepassHtmlAndBodyAttributes
    )
    hasRenderedHead = true

    return () => {
      if (hasRenderedHead) {
        render(null, hiddenRoot)
        hasRenderedHead = false
      }
      removePrevHeadElements()
      removeHtmlAndBodyAttributes(keysOfHtmlAndBodyAttributes)
    }
  })
}
