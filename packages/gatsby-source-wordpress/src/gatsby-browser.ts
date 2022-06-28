/* global HAS_REACT_18 */
import type { GatsbyImageProps } from "gatsby-plugin-image"
import React from "react"

let hydrateRef

export function onRouteUpdate(): void {
  if (`requestIdleCallback` in window) {
    if (hydrateRef) {
      // @ts-ignore cancelIdleCallback is on window object
      cancelIdleCallback(hydrateRef)
    }

    // @ts-ignore requestIdleCallback is on window object
    hydrateRef = requestIdleCallback(hydrateImages)
  } else {
    if (hydrateRef) {
      clearTimeout(hydrateRef)
    }
    hydrateRef = setTimeout(hydrateImages)
  }
}

declare const HAS_REACT_18: boolean

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ReactDOM: any

if (HAS_REACT_18) {
  ReactDOM = require(`react-dom/client`)
} else {
  ReactDOM = require(`react-dom`)
}

function hydrateImages(): void {
  const doc = document
  const inlineWPimages: Array<HTMLElement> = Array.from(
    doc.querySelectorAll(`[data-wp-inline-image]`)
  )

  if (!inlineWPimages.length) {
    return
  }

  import(
    /* webpackChunkName: "gatsby-plugin-image" */ `gatsby-plugin-image`
  ).then(mod => {
    inlineWPimages.forEach(image => {
      if (image.dataset && image.dataset.wpInlineImage && image.parentNode) {
        const hydrationData = doc.querySelector(
          `script[data-wp-inline-image-hydration="${image.dataset.wpInlineImage}"]`
        )

        if (hydrationData) {
          const imageProps: GatsbyImageProps = JSON.parse(
            hydrationData.innerHTML
          )

          if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(image.parentNode)
            root.render(React.createElement(mod.GatsbyImage, imageProps))
          } else {
            ReactDOM.hydrate(
              React.createElement(mod.GatsbyImage, imageProps),
              image.parentNode
            )
          }
        }
      }
    })
  })
}
