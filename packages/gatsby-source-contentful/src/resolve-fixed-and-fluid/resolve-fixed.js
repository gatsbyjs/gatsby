import _ from "lodash"
import { isImage } from "../extend-node-type"
import {
  computeAspectRatio,
  CONTENTFUL_IMAGE_MAX_SIZE,
  createUrl,
  getBasicImageProps,
} from "./helpers/shared-helpers"
import {
  buildFixedSrcSet,
  resolveWidthAndHeight,
  setResizingBehavior,
} from "./helpers/fixed-helpers"

export const resolveFixed = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)
  const fixedWidth = options.width || 400
  const desiredAspectRatio = computeAspectRatio(options, aspectRatio)
  options.resizingBehavior = setResizingBehavior(options)
  const [resolvedHeight, resolvedWidth] = resolveWidthAndHeight(
    options,
    desiredAspectRatio,
    fixedWidth
  )

  const filteredSizes = [
    fixedWidth,
    fixedWidth * 1.5,
    fixedWidth * 2,
    fixedWidth * 3,
  ]
    .map(Math.round)
    .filter(size => {
      const calculatedHeight = Math.round(size / desiredAspectRatio)
      return (
        size <= CONTENTFUL_IMAGE_MAX_SIZE &&
        calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
        size <= width
      )
    })

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    width: resolvedWidth,
    height: resolvedHeight,
    src: createUrl(baseUrl, {
      ...options,
      width: options.width,
    }),
    srcSet: buildFixedSrcSet(
      _.sortBy(filteredSizes.filter(size => size <= width)),
      desiredAspectRatio,
      baseUrl,
      options
    ),
  }
}
