import React from "react"
import Portal from "./portal"
import Style from "./style"
import { isLoadingIndicatorEnabled } from "$virtual/loading-indicator"
import { debugLog } from "../debug-log"

if (typeof window === `undefined`) {
  throw new Error(
    `Loading indicator should never be imported in code that doesn't target only browsers`
  )
}

if (module.hot) {
  module.hot.accept(`$virtual/loading-indicator`, () => {
    // isLoadingIndicatorEnabled is imported with ES import so no need
    // for dedicated handling as HMR just replace it in that case
  })
}

// HMR can rerun this, so check if it was set before
// we also set it on window and not just in module scope because of HMR resetting
// module scope
if (typeof window.___gatsbyDidShowLoadingIndicatorBefore === `undefined`) {
  window.___gatsbyDidShowLoadingIndicatorBefore = false
}

export function Indicator() {
  if (!isLoadingIndicatorEnabled()) {
    return null
  }

  if (!window.___gatsbyDidShowLoadingIndicatorBefore) {
    // not ideal to this in render function, but that's just console info
    debugLog(
      `You might have seen "gatsby develop" loading indicator in the bottom left corner.\n\nIf you want to disable it you can visit ${window.location.origin}/___loading-indicator/disable (will disable it for current session) or add following snippet in gatsby-config.js:\n\nflags: {\n  QUERY_ON_DEMAND: {\n    loadingIndicator: false\n  }\n}`
    )
    window.___gatsbyDidShowLoadingIndicatorBefore = true
  }

  return (
    <Portal>
      <Style />
      <div data-gatsby-loading-indicator="root">
        <div data-gatsby-loading-indicator="spinner" aria-hidden={true} />
        <div data-gatsby-loading-indicator="text">Loading</div>
      </div>
    </Portal>
  )
}
