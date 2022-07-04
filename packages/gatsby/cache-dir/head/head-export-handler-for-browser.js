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

export function headHandlerForBrowser({
  pageComponent,
  staticQueryResults,
  pageComponentProps,
}) {
  if (pageComponent.head) {
    headExportValidator(pageComponent.head)

    const headElement = createElement(
      StaticQueryContext.Provider,
      { value: staticQueryResults },
      createElement(
        pageComponent.head,
        filterHeadProps(pageComponentProps),
        null
      )
    )

    const { render } = reactDOMUtils()

    useEffect(() => {
      const hiddenRoot = document.createElement(`div`)

      const callback = () => {
        // Remove previous head nodes
        const prevHeadNodes = [
          ...document.querySelectorAll(`[data-gatsby-head]`),
        ]
        prevHeadNodes.forEach(e => e.remove())

        // add attribute to new head nodes while showing warning if it's not a valid node
        const validHeadNodes = []

        for (const node of hiddenRoot.childNodes) {
          const nodeName = node.nodeName.toLowerCase()

          if (!VALID_NODE_NAMES.includes(nodeName)) {
            warnForInvalidTags(nodeName)
          } else {
            node.setAttribute(`data-gatsby-head`, true)
            validHeadNodes.push(node)
          }
        }

        document.head.append(...validHeadNodes)
      }

      // Use react18's .createRoot.render or fallback to .render
      // just a hack to call the callback after react has done first render
      render(
        <FireCallbackInEffect callback={callback}>
          {headElement}
        </FireCallbackInEffect>,
        hiddenRoot
      )
    }, [headElement])
  }
}
