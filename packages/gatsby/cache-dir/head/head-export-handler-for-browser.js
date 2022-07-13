import React from "react"
import { createElement, useEffect } from "react"
import { StaticQueryContext } from "gatsby"
import { reactDOMUtils } from "../react-dom-utils"
import { FireCallbackInEffect } from "./components/fire-callback-in-effect"
import { VALID_NODE_NAMES } from "./constants"
import {
  headExportValidator,
  filterHeadProps,
  warnForInvalidTags,
} from "./utils"

const hiddenRoot = document.createElement(`div`)
const onHeadRendered = () => {
  // add attribute to new head nodes while showing warning if it's not a valid node
  const validHeadNodes = []

  for (const node of hiddenRoot.childNodes) {
    const nodeName = node.nodeName.toLowerCase()

    if (!VALID_NODE_NAMES.includes(nodeName)) {
      warnForInvalidTags(nodeName)
    } else {
      const clonedNode = node.cloneNode(true)
      clonedNode.setAttribute(`data-gatsby-head`, true)
      validHeadNodes.push(clonedNode)
    }
  }

  document.head.append(...validHeadNodes)
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
    if (pageComponent.Head) {
      headExportValidator(pageComponent.Head)

      const headElement = createElement(
        StaticQueryContext.Provider,
        { value: staticQueryResults },
        createElement(
          pageComponent.Head,
          filterHeadProps(pageComponentProps),
          null
        )
      )

      const { render } = reactDOMUtils()

      // Use react18's .createRoot.render or fallback to .render
      // just a hack to call the callback after react has done first render
      render(
        <FireCallbackInEffect callback={onHeadRendered}>
          {headElement}
        </FireCallbackInEffect>,
        hiddenRoot
      )
    }

    return () => {
      // Remove previous head nodes
      const prevHeadNodes = [...document.querySelectorAll(`[data-gatsby-head]`)]
      prevHeadNodes.forEach(e => e.remove())
    }
  })
}
