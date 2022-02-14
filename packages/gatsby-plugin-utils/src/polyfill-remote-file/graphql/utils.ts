import { ImageFormat } from "../types"

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
