import { createUrl } from "./shared-helpers"

export const buildFixedSrcSet = (sizes, aspectRatio, baseUrl, options) =>
  sizes
    .map((size, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `1x`
          break
        case 1:
          resolution = `1.5x`
          break
        case 2:
          resolution = `2x`
          break
        case 3:
          resolution = `3x`
          break
        default:
      }
      const h = Math.round(size / aspectRatio)

      return `${createUrl(baseUrl, {
        ...options,
        width: size,
        height: h,
      })} ${resolution}`
    })
    .join(`,\n`)

export const resolveWidthAndHeight = (options, aspectRatio, width) => {
  let resolvedHeight
  let resolveWidth

  if (options.height) {
    resolvedHeight = options.height
    resolveWidth = options.height * aspectRatio
  } else {
    resolvedHeight = width / aspectRatio
    resolveWidth = width
  }
  return [Math.round(resolvedHeight), Math.round(resolveWidth)]
}

export const setResizingBehavior = options => {
  if (options.width !== undefined && options.height !== undefined) {
    if (!options.resizingBehavior) {
      return `fill`
    }
  }
  return options.resizingBehavior
}
