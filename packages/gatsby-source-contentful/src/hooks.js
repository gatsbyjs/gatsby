import { useGatsbyImage, EVERY_BREAKPOINT } from "gatsby-plugin-image"

import { generateImageSource } from "./extend-node-type"

export function useContentfulImage({
  layout = `constrained`,
  baseUrl,
  width,
  height,
  aspectRatio,
  maxWidth,
  ...props
}) {
  const breakpoints = maxWidth
    ? EVERY_BREAKPOINT.filter(bp => bp <= maxWidth)
    : EVERY_BREAKPOINT

  if (layout === `fullWidth`) {
    width ||= maxWidth || breakpoints[breakpoints.length - 1]
    height ||= aspectRatio ? width / aspectRatio : width / (4 / 3)
  } else {
    if (!width || (!height && !aspectRatio)) {
      throw new Error(
        `You must provide width and height for images where layout is ${layout}`
      )
    }
    if (aspectRatio) {
      height ||= width / aspectRatio
    }
  }

  return useGatsbyImage({
    ...props,
    pluginName: `useContentfulImage`,
    generateImageSource,
    layout,
    filename: baseUrl,
    formats: [`auto`],
    breakpoints,
    sourceMetadata: {
      width,
      height,
      format: `auto`,
    },
  })
}
