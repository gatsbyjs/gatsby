import { CONTENTFUL_IMAGE_MAX_SIZE, createUrl } from "./shared-helpers"

export const resolveMaxWidth = (options, aspectRatio) => {
  if (options.maxHeight && !options.maxWidth) {
    return Math.round(options.maxHeight * aspectRatio)
  }

  return options.maxWidth || 800
}

export const setSizes = (options, maxWidth) => {
  if (options.sizes) {
    return options.sizes
  }

  return `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`
}

export const buildFluidSrcSet = (aspectRatio, image, options, sizes) =>
  sizes
    .map(width => {
      const h = Math.round(width / aspectRatio)
      return `${createUrl(image.file.url, {
        ...options,
        width,
        height: h,
      })} ${Math.round(width)}w`
    })
    .join(`,\n`)

export const filterSizes = (sizes, aspectRatio, width) =>
  sizes.filter(size => {
    const calculatedHeight = Math.round(size / aspectRatio)
    return (
      size <= CONTENTFUL_IMAGE_MAX_SIZE &&
      calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
      size <= width
    )
  })

export const addOriginalImage = (filteredSizes, width, aspectRatio) => {
  if (
    !filteredSizes.includes(parseInt(width)) &&
    parseInt(width) < CONTENTFUL_IMAGE_MAX_SIZE &&
    Math.round(width / aspectRatio) < CONTENTFUL_IMAGE_MAX_SIZE
  ) {
    filteredSizes.push(width)
  }
}
