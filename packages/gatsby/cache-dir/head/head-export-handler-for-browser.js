import React from "react"
import { useEffect } from "react"
import { StaticQueryContext } from "gatsby"
import { LocationProvider } from "@gatsbyjs/reach-router"
import { reactDOMUtils } from "../react-dom-utils"
import { FireCallbackInEffect } from "./components/fire-callback-in-effect"
import { VALID_NODE_NAMES } from "./constants"
import {
  headExportValidator,
  filterHeadProps,
  warnForInvalidTags,
  diffNodes,
} from "./utils"

const hiddenRoot = document.createElement(`div`)
const htmlAttributesList = new Set()
const bodyAttributesList = new Set()

const removePrevHtmlAttributes = () => {
  htmlAttributesList.forEach(attributeName => {
    const elementTag = document.getElementsByTagName(`html`)[0]
    elementTag.removeAttribute(attributeName)
  })
}

const removePrevBodyAttributes = () => {
  bodyAttributesList.forEach(attributeName => {
    const elementTag = document.getElementsByTagName(`body`)[0]
    elementTag.removeAttribute(attributeName)
  })
}

const updateAttribute = (
  tagName,
  attributeName,
  attributeValue,
  attributesList
) => {
  const elementTag = document.getElementsByTagName(tagName)[0]

  if (!elementTag) {
    return
  }

  elementTag.setAttribute(attributeName, attributeValue)
  attributesList.add(attributeName)
}

const removePrevHeadElements = () => {
  const prevHeadNodes = document.querySelectorAll(`[data-gatsby-head]`)

  for (const node of prevHeadNodes) {
    node.parentNode.removeChild(node)
  }
}

const onHeadRendered = () => {
  const validHeadNodes = []
  const seenIds = new Map()

  for (const node of hiddenRoot.childNodes) {
    const nodeName = node.nodeName.toLowerCase()
    const id = node.attributes?.id?.value

    if (!VALID_NODE_NAMES.includes(nodeName)) {
      warnForInvalidTags(nodeName)
      continue
    }

    if (nodeName === `html`) {
      for (const attribute of node.attributes) {
        updateAttribute(
          `html`,
          attribute.name,
          attribute.value,
          htmlAttributesList
        )
      }
      continue
    }

    if (nodeName === `body`) {
      for (const attribute of node.attributes) {
        updateAttribute(
          `body`,
          attribute.name,
          attribute.value,
          bodyAttributesList
        )
      }
      continue
    }

    let clonedNode = node.cloneNode(true)
    clonedNode.setAttribute(`data-gatsby-head`, true)

    // Create an element for scripts to make script work
    if (clonedNode.nodeName.toLowerCase() === `script`) {
      const script = document.createElement(`script`)
      for (const attr of clonedNode.attributes) {
        script.setAttribute(attr.name, attr.value)
      }
      script.innerHTML = clonedNode.innerHTML
      clonedNode = script
    }

    if (id) {
      if (!seenIds.has(id)) {
        validHeadNodes.push(clonedNode)
        seenIds.set(id, validHeadNodes.length - 1)
      } else {
        const indexOfPreviouslyInsertedNode = seenIds.get(id)
        validHeadNodes[indexOfPreviouslyInsertedNode].parentNode?.removeChild(
          validHeadNodes[indexOfPreviouslyInsertedNode]
        )
        validHeadNodes[indexOfPreviouslyInsertedNode] = clonedNode

        continue
      }
    } else {
      validHeadNodes.push(clonedNode)
    }
  }

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
      args[0]?.includes(`validateDOMNesting(...): %s cannot appear as`) &&
      (args[1] === `<html>` || args[1] === `<body>`)
    ) {
      return undefined
    }
    return originalConsoleError(...args)
  }

  // We set up observer to be able to regenerate <head> after react-refresh
  // updates our hidden element.
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
  useEffect(() => {
    if (pageComponent?.Head) {
      headExportValidator(pageComponent.Head)

      const { render } = reactDOMUtils()

      const Head = pageComponent.Head

      render(
        // just a hack to call the callback after react has done first render
        // Note: In dev, we call onHeadRendered twice( in FireCallbackInEffect and after mutualution observer dectects initail render into hiddenRoot) this is for hot reloading
        // In Prod we only call onHeadRendered in FireCallbackInEffect to render to head
        <FireCallbackInEffect callback={onHeadRendered}>
          <StaticQueryContext.Provider value={staticQueryResults}>
            <LocationProvider>
              <Head {...filterHeadProps(pageComponentProps)} />
            </LocationProvider>
          </StaticQueryContext.Provider>
        </FireCallbackInEffect>,
        hiddenRoot
      )
    }

    return () => {
      removePrevHeadElements()
      removePrevHtmlAttributes()
      removePrevBodyAttributes()
    }
  })
}
