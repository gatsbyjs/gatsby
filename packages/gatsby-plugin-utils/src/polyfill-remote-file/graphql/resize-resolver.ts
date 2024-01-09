import { generateImageUrl } from "../utils/url-generator"
import { getImageFormatFromMimeType } from "../utils/mime-type-helpers"
import { stripIndent } from "../utils/strip-indent"
import {
  dispatchLocalImageServiceJob,
  shouldDispatchLocalImageServiceJob,
} from "../jobs/dispatchers"
import { isImage } from "../types"
import { validateAndNormalizeFormats, calculateImageDimensions } from "./utils"

import type { Actions, Store } from "gatsby"
import type {
  IRemoteFileNode,
  IGraphQLFieldConfigDefinition,
  ImageFit,
  ImageFormat,
  ImageCropFocus,
  WidthOrHeight,
} from "../types"
import type { getRemoteFileEnums } from "./get-remote-file-enums"

interface IResizeArgs {
  fit: ImageFit
  format: ImageFormat
  cropFocus: Array<ImageCropFocus>
  quality: number
  aspectRatio: number
}

const DEFAULT_QUALITY = 75

const allowedFormats: Array<ImageFormat> = [
  `jpg`,
  `png`,
  `webp`,
  `avif`,
  `auto`,
]

export async function resizeResolver(
  source: IRemoteFileNode,
  args: Partial<IResizeArgs> & WidthOrHeight,
  actions: Actions,
  store?: Store
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

  if (!args.quality) {
    args.quality = DEFAULT_QUALITY
  }

  if (!allowedFormats.includes(args.format)) {
    throw new Error(
      `Unknown format "${args.format}" was given to resize ${source.url}`
    )
  }

  if (!args.width && !args.height) {
    throw new Error(`No width or height is given to resize "${source.url}"`)
  }

  const formats = validateAndNormalizeFormats(
    [args.format],
    getImageFormatFromMimeType(source.mimeType)
  )
  const [format] = formats
  const { width, height } = calculateImageDimensions(
    source,
    args as IResizeArgs & WidthOrHeight
  )

  if (shouldDispatchLocalImageServiceJob()) {
    dispatchLocalImageServiceJob(
      {
        url: source.url,
        mimeType: source.mimeType,
        filename: source.filename,
        contentDigest: source.internal.contentDigest,
      },
      {
        ...(args as IResizeArgs),
        width,
        height,
        format,
      },
      actions,
      store
    )
  }

  const src = generateImageUrl(
    source,
    {
      ...(args as IResizeArgs),
      width,
      height,
      format,
    },
    store
  )

  return {
    src,
    width,
    height,
  }
}

export function generateResizeFieldConfig(
  enums: ReturnType<typeof getRemoteFileEnums>,
  actions: Actions,
  store?: Store
): IGraphQLFieldConfigDefinition<
  IRemoteFileNode,
  ReturnType<typeof resizeResolver>,
  IResizeArgs & WidthOrHeight
> {
  return {
    type: `RemoteFileResize`,
    args: {
      width: `Int`,
      height: `Int`,
      aspectRatio: `Float`,
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
        type: enums.cropFocus.List.getTypeName(),
      },
      quality: {
        type: `Int`,
        defaultValue: DEFAULT_QUALITY,
      },
    },
    resolve(source, args): ReturnType<typeof resizeResolver> {
      return resizeResolver(source, args, actions, store)
    },
  }
}
