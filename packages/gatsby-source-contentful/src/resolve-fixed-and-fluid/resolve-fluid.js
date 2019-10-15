import _ from "lodash"
import { isImage } from "../extend-node-type"
import {
  getBasicImageProps,
  createUrl,
  computeAspectRatio,
  CONTENTFUL_IMAGE_MAX_SIZE,
} from "./helpers/shared-helpers"
import {
  buildFluidSrcSet,
  setSizes,
  resolveMaxWidth,
  filterSizes,
} from "./helpers/fluid-helpers"

export const resolveFluid = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)
  let desiredAspectRatio = computeAspectRatio(options, aspectRatio)
  const maxWidth = resolveMaxWidth(options, desiredAspectRatio)
  const filteredSizes = _.sortBy(
    filterSizes(
      [
        maxWidth / 4,
        maxWidth / 2,
        maxWidth,
        maxWidth * 1.5,
        maxWidth * 2,
        maxWidth * 3,
      ].map(Math.round),
      desiredAspectRatio,
      width
    )
  )

  // Add the original image (if it isn't already in there) to ensure the largest image possible
  // is available for small images.
  if (
    !filteredSizes.includes(parseInt(width)) &&
    parseInt(width) < CONTENTFUL_IMAGE_MAX_SIZE &&
    Math.round(width / desiredAspectRatio) < CONTENTFUL_IMAGE_MAX_SIZE
  ) {
    filteredSizes.push(width)
  }

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    src: createUrl(baseUrl, {
      ...options,
      width: maxWidth,
      height: options.maxHeight,
    }),
    srcSet: buildFluidSrcSet(desiredAspectRatio, image, options, filteredSizes),
    sizes: options.sizes || setSizes(options, maxWidth),
  }
}
