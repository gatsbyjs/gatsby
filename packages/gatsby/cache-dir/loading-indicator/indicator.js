import React from "react"
import Portal from "./portal"
import Style from "./style"
import { isLoadingIndicatorEnabled } from "$virtual/loading-indicator"

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
