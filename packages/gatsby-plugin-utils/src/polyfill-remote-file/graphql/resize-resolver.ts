import { generatePublicUrl, generateImageArgs } from "../utils/url-generator"
import { getImageFormatFromMimeType } from "../utils/mime-type-helpers"
import { stripIndent } from "../utils/strip-indent"
import {
  dispatchLocalImageServiceJob,
  shouldDispatch,
} from "../jobs/dispatchers"
import { isImage } from "../types"
import { validateAndNormalizeFormats, calculateImageDimensions } from "./utils"

import type { Store } from "gatsby"
import type {
  IRemoteFileNode,
  IGraphQLFieldConfigDefinition,
  ImageFit,
  ImageFormat,
  ImageCropFocus,
} from "../types"
import type { getRemoteFileEnums } from "./get-remote-file-enums"

interface IResizeArgs {
  width: number
  height: number
  fit: ImageFit
  format: ImageFormat
  cropFocus: ImageCropFocus
}

export async function resizeResolver(
  source: IRemoteFileNode,
  args: IResizeArgs,
  store: Store
): Promise<{
  width: number
  height: number
  src: string
} | null> {
  if (!isImage(source)) {
    return null
  }

  if (!args.format) {
    args.format = `auto`
  }

  if (!args.fit) {
    args.fit = `cover`
  }

  if (!args.cropFocus) {
    args.cropFocus = `edges`
  }

  const formats = validateAndNormalizeFormats(
    [args.format],
    getImageFormatFromMimeType(source.mimeType)
  )
  const [format] = formats
  const { width, height } = calculateImageDimensions(source, args)

  if (shouldDispatch()) {
    dispatchLocalImageServiceJob(
      {
        url: source.url,
        extension: format,
        ...args,
        format,
        contentDigest: source.internal.contentDigest,
      },
      store
    )
  }

  const src = `${generatePublicUrl(source)}/${generateImageArgs({
    ...args,
    format,
  })}.${format}`

  return {
    src,
    width,
    height,
  }
}

export function generateResizeFieldConfig(
  enums: ReturnType<typeof getRemoteFileEnums>,
  store: Store
): IGraphQLFieldConfigDefinition<
  IRemoteFileNode,
  ReturnType<typeof resizeResolver>,
  IResizeArgs
> {
  return {
    type: `RemoteFileResize`,
    args: {
      width: `Int`,
      height: `Int`,
      fit: {
        type: enums.fit.getTypeName(),
        defaultValue: enums.fit.getField(`COVER`).value,
      },
      format: {
        type: enums.format.getTypeName(),
        defaultValue: enums.format.getField(`AUTO`).value,
        description: stripIndent`
      The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, WEBP and AVIF.
      The default value is [AUTO, WEBP, AVIF], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
      not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
      both PNG and JPG is not supported and will be ignored.`,
      },
      cropFocus: {
        type: enums.cropFocus.getTypeName(),
        defaultValue: enums.cropFocus.getField(`EDGES`)
          .value as IResizeArgs["cropFocus"],
      },
    },
    resolve(source, args: IResizeArgs): ReturnType<typeof resizeResolver> {
      return resizeResolver(source, args, store)
    },
  }
}
