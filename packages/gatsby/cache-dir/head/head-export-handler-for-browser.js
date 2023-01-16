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
  getValidHeadNodes,
} from "./utils"
import { apiRunner } from "../api-runner-browser"

const removePrevHeadElements = () => {
  const prevHeadNodes = document.querySelectorAll(`[data-gatsby-head]`)
  for (const node of prevHeadNodes) {
    node.parentNode.removeChild(node)
  }
  const whatsLEft = document.querySelectorAll(`[data-gatsby-head]`)
}

const hiddenRoot = document.createElement(`div`)

const onHeadRendered = () => {
  const validHeadNodes = getValidHeadNodes(hiddenRoot)
  console.log(`validHeadNodes`, validHeadNodes)
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

      render(
        // just a hack to call the callback after react has done first render
        // Note: In dev, we call onHeadRendered twice( in FireCallbackInEffect and after mutualution observer dectects initail render into hiddenRoot) this is for hot reloading
        // In Prod we only call onHeadRendered in FireCallbackInEffect to render to head
        <FireCallbackInEffect callback={onHeadRendered}>
          <StaticQueryContext.Provider value={staticQueryResults}>
            <LocationProvider>{WrapHeadElement}</LocationProvider>
          </StaticQueryContext.Provider>
        </FireCallbackInEffect>,
        hiddenRoot
      )
    }

    return () => {
      removePrevHeadElements()
    }
  })
}
