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

export function Indicator({ visible = true }) {
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
      <div
        data-gatsby-loading-indicator="root"
        data-gatsby-loading-indicator-visible={visible}
        aria-live="assertive"
      >
        <div data-gatsby-loading-indicator="spinner" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
          </svg>
        </div>
        <div data-gatsby-loading-indicator="text">
          {visible ? `Preparing requested page` : ``}
        </div>
      </div>
    </Portal>
  )
}
