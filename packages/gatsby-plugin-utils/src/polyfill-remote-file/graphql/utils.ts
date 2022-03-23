import { ImageFormat, ImageFit, WidthOrHeight } from "../types"

export function validateAndNormalizeFormats(
  formats: Array<ImageFormat>,
  sourceFormat: ImageFormat
): Set<ImageFormat> {
  const formatSet = new Set<ImageFormat>(formats)

  // convert auto in format of source image
  if (formatSet.has(`auto`)) {
    formatSet.delete(`auto`)
    formatSet.add(sourceFormat)
  }

  if (formatSet.has(`jpg`) && formatSet.has(`png`)) {
    throw new Error(`Cannot specify both JPG and PNG formats`)
  }

  return formatSet
}

/**
 * Generate correct width and height like sharp will do
 * @see https://sharp.pixelplumbing.com/api-resize#resize
 */
export function calculateImageDimensions(
  originalDimensions: { width: number; height: number },
  {
    fit,
    width: requestedWidth,
    height: requestedHeight,
    aspectRatio: requestedAspectRatio,
  }: { fit: ImageFit; aspectRatio: number } & WidthOrHeight
): { width: number; height: number; aspectRatio: number } {
  // Calculate the eventual width/height of the image.
  let imageAspectRatio
  if (requestedAspectRatio) {
    imageAspectRatio = requestedAspectRatio
  } else {
    imageAspectRatio = originalDimensions.width / originalDimensions.height
  }

  let width = requestedWidth
  let height = requestedHeight
  switch (fit) {
    case `inside`: {
      const widthOption = requestedWidth ?? Number.MAX_SAFE_INTEGER
      const heightOption = requestedHeight ?? Number.MAX_SAFE_INTEGER

      width = Math.min(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.min(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }
    case `outside`: {
      const widthOption = requestedWidth ?? 0
      const heightOption = requestedHeight ?? 0

      width = Math.max(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.max(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }
    case `fill`: {
      width = requestedWidth ?? originalDimensions.width
      height = requestedHeight ?? originalDimensions.height

      break
    }

    default: {
      if (requestedWidth && !requestedHeight) {
        width = requestedWidth
        height = Math.round(requestedWidth / imageAspectRatio)
      }

      if (requestedHeight && !requestedWidth) {
        width = Math.round(requestedHeight * imageAspectRatio)
        height = requestedHeight
      }
    }
  }

  return {
    width: width as number,
    height: height as number,
    aspectRatio: (width as number) / (height as number),
  }
}
