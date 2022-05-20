import type { GatsbyImageProps } from "gatsby-plugin-image"
import React from "react"

let hydrateRef
let isFirstHydration = true
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export function onRouteUpdate(): void {
  if (
    process.env.NODE_ENV === `production` &&
    isFirstHydration &&
    // Safari has a bug that causes images to stay blank when directly loading a page (images load when client-side navigating)
    // running this code on first hydration makes images load.
    !isSafari
  ) {
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

let hasWarnedReact17 = false

function hydrateImages(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ReactDOM: any

  try {
    ReactDOM = require(`react-dom/client`)
  } catch (e) {
    if (process.env.NODE_ENV === `development` && !hasWarnedReact17) {
      hasWarnedReact17 = true
      console.warn(
        `Upgrade to React 18+ to fix the "Module not found: Can't resolve 'react-dom/client'" warning.`
      )
    }

    ReactDOM = require(`react-dom`)
  }

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

          if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(image.parentNode)
            root.render(React.createElement(mod.GatsbyImage, imageProps))
          } else {
            const element = React.createElement(mod.GatsbyImage, imageProps)

            if (parent) {
              ReactDOM.hydrate(element, image.parentNode)
            }
          }
        }
      }
    })
  })
}
