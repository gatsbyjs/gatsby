import qs from "qs"
import _ from "lodash"

// @see https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-width-&-height
export const CONTENTFUL_IMAGE_MAX_SIZE = 4000

export const createUrl = (imgUrl, options) => {
  // Create an optimized image url that Gatsby Image can consume

  if (options) {
    const {
      width,
      height,
      jpegProgressive,
      quality,
      toFormat,
      resizingBehavior,
      cropFocus,
      background,
    } = options

    const args = _.pickBy({
      w: width,
      h: height,
      fl: jpegProgressive ? `progressive` : null,
      q: quality,
      fm: toFormat,
      fit: resizingBehavior,
      f: cropFocus,
      bg: background,
    })

    return `${imgUrl}?${qs.stringify(args)}`
  }

  return imgUrl
}

export const computeAspectRatio = (options, originalAspectRatio) => {
  const { width, height, maxWidth, maxHeight } = options
  if (width && height) {
    return width / height
  }
  if (maxWidth && maxHeight) {
    return maxWidth / maxHeight
  }
  return originalAspectRatio
}

export const getBasicImageProps = (image, options) => {
  const { url, contentType } = image.file
  const { width, height } = image.file.details.image

  let aspectRatio
  if (options.width && options.height) {
    aspectRatio = options.width / options.height
  } else {
    aspectRatio = width / height
  }

  return {
    baseUrl: url,
    contentType,
    aspectRatio,
    width,
    height,
  }
}
