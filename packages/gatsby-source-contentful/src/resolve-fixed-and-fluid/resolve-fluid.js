import _ from "lodash"
import { isImage } from "../extend-node-type"
import {
  computeAspectRatio,
  createUrl,
  getBasicImageProps,
} from "./helpers/shared-helpers"
import {
  addOriginalImage,
  buildFluidSrcSet,
  filterSizes,
  resolveMaxWidth,
  setSizes,
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

  addOriginalImage(filteredSizes, width, desiredAspectRatio)

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
