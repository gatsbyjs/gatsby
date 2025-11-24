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

const hiddenRoot = document.createElement(`div`)
const keysOfHtmlAndBodyAttributes = {
  html: [],
  body: [],
}

const onHeadRendered = () => {
  const { validHeadNodes, htmlAndBodyAttributes } =
    getValidHeadNodesAndAttributes(hiddenRoot)

  keysOfHtmlAndBodyAttributes.html = Object.keys(htmlAndBodyAttributes.html)
  keysOfHtmlAndBodyAttributes.body = Object.keys(htmlAndBodyAttributes.body)

  applyHtmlAndBodyAttributes(htmlAndBodyAttributes)

  /**
   * The rest of the code block below is a diffing mechanism to ensure that
   * the head elements aren't duplicated on every re-render.
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

// TODO(serhalp): Expose these as a new public API to allows us to gradually phase out
// the existing `<html>` and `<body>` features in the Head API, allowing us to remove
// the various workounds we have in place for React 19.
function Html(props) {
  return <div data-original-tag="html" {...props} />
}
function Body(props) {
  return <div data-original-tag="body" {...props} />
}

// React 19 does not allow rendering a second `<html>` or `<body>` anywhere in the tree:
// https://github.com/facebook/react/blob/50e7ec8a694072fd6fcd52182df8a75211bf084d/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L3739
// Unfortunately, our Head API relies on users being able to render these elements, which we then
// render in a hidden `<div>` to extract attributes to apply to the real `<html>` and `<body>`.
// We explored several alternatives, but none were viable given React's constraints.
// To work around this, we intercept attempts to render these elements inside of
// Head and replace them with custom components that render as `<div>`s with a
// `data-original-tag` attribute. We can then use this attribute later to apply
// attributes to the real `<html>` and `<body>` elements.
const IsHeadRenderContext = React.createContext(false)
// De-risk monkey patch by only applying it when needed (React 19+, not React 18)
const reactMajor = parseInt(React.version.split(`.`)[0], 10)
if (reactMajor !== 18) {
  const originalCreateElement = React.createElement
  React.createElement = (type, ...rest) => {
    if (type === `html` || type === `body`) {
      const isHeadRender = React.useContext(IsHeadRenderContext)
      // De-risk monkey patch by only applying it within a `Head()` render.
      if (isHeadRender) {
        type = type === `html` ? Html : Body
      }
    }
    return originalCreateElement(type, ...rest)
  }
}
export function headHandlerForBrowser({
  pageComponent,
  staticQueryResults,
  pageComponentProps,
}) {
  useEffect(() => {
    if (pageComponent?.Head) {
      headExportValidator(pageComponent.Head)

      const { render } = reactDOMUtils()

      const HeadElement = (
        // Wrap in an SVG to work around conflict between React 19's new document metadata tag
        // hoisting and Gatsby's own preexisting Head API. React will leave metadata tags (like
        // `<title>`) with an `<svg>` ancestor intact, letting Gatsby process them as usual. See
        // https://github.com/facebook/react/blob/fd524fe02a86c3e92a207d90da970941320f337f/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L765-L779.
        <svg data-gatsby-head-react-19-workaround="true">
          <pageComponent.Head {...filterHeadProps(pageComponentProps)} />
        </svg>
      )

      const WrapHeadElement = apiRunner(
        `wrapRootElement`,
        { element: HeadElement },
        HeadElement,
        ({ result }) => {
          return { element: result }
        }
      ).pop()

      render(
        // just a hack to call the callback after react has done first render
        // Note: In dev, we call onHeadRendered twice( in FireCallbackInEffect and after mutualution observer dectects initail render into hiddenRoot) this is for hot reloading
        // In Prod we only call onHeadRendered in FireCallbackInEffect to render to head
        <FireCallbackInEffect callback={onHeadRendered}>
          <IsHeadRenderContext.Provider value={true}>
            <StaticQueryContext.Provider value={staticQueryResults}>
              <LocationProvider>{WrapHeadElement}</LocationProvider>
            </StaticQueryContext.Provider>
          </IsHeadRenderContext.Provider>
        </FireCallbackInEffect>,
        hiddenRoot
      )
    }

    return () => {
      removePrevHeadElements()
      removeHtmlAndBodyAttributes(keysOfHtmlAndBodyAttributes)
    }
  })
}
