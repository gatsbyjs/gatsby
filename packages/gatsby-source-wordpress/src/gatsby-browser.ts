import type { GatsbyImageProps } from "gatsby-plugin-image"
import * as React from "react"
import * as ReactDOM from "react-dom"

let hydrateRef
let isFirstHydration = true
export function onRouteUpdate(): void {
  if (isFirstHydration) {
    isFirstHydration = false
    return
  }

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

function hydrateImages(): void {
  const doc = document
  const inlineWPimages: Array<HTMLElement> = Array.from(
    doc.querySelectorAll(`[data-wp-inline-image]`)
  )

  import(
    /* webpackChunkName: "gatsby-plugin-image" */ `gatsby-plugin-image`
  ).then(mod => {
    inlineWPimages.forEach(image => {
      if (
        image.dataset &&
        image.dataset.wpInlineImage &&
        image.parentNode.parentNode
      ) {
        const hydrationData = doc.querySelector(
          `script[data-wp-inline-image-hydration="${image.dataset.wpInlineImage}"]`
        )

        if (hydrationData) {
          const imageProps: GatsbyImageProps = JSON.parse(
            hydrationData.innerHTML
          )

          // @ts-ignore - createRoot is on ReactDOM
          if (ReactDOM.createRoot) {
            // @ts-ignore - createRoot is on ReactDOM
            const root = ReactDOM.createRoot(image.parentNode.parentNode)
            // @ts-ignore - not same as below, not sure why it's complaining
            root.render(React.createElement(mod.default, imageProps), {
              hydrate: true,
            })
          } else {
            ReactDOM.hydrate(
              // @ts-ignore - no idea why it complains
              React.createElement(mod.GatsbyImage, imageProps),
              image.parentNode.parentNode
            )
          }
        }
      }
    })
  })
}
