import { basename, extname } from "path"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import { isImage } from "../types"
import type { ImageCropFocus, WidthOrHeight } from "../types"

// export enum ImageCDNKeys {
//   url: 'u',

// }

export function generateFileUrl({
  url,
  filename,
}: {
  url: string
  filename: string
}): string {
  const fileExt = extname(filename)
  const filenameWithoutExt = basename(filename, fileExt)

  return `${generatePublicUrl({ url })}/${encodeURIComponent(
    filenameWithoutExt
  )}${fileExt}`
}

export function generateImageUrl(
  source: { url: string; mimeType: string; filename: string },
  imageArgs: Parameters<typeof generateImageArgs>[0]
): string {
  const filenameWithoutExt = basename(source.filename, extname(source.filename))

  return `${generatePublicUrl(source)}/${createContentDigest(
    generateImageArgs(imageArgs)
  )}/${encodeURIComponent(filenameWithoutExt)}.${
    imageArgs.format
  }?u=${encodeURIComponent(source.url)}&a=${encodeURIComponent(
    generateImageArgs(imageArgs)
  )}`
}

function generatePublicUrl({
  url,
  mimeType,
}: {
  url: string
  mimeType?: string
}): string {
  const remoteUrl = createContentDigest(url)

  let publicUrl =
    mimeType && isImage({ mimeType }) ? `/_gatsby/image/` : `/_gatsby/file/`
  publicUrl += `${remoteUrl}`

  return publicUrl
}

function generateImageArgs({
  width,
  height,
  format,
  cropFocus,
  quality,
}: WidthOrHeight & {
  format: string
  cropFocus?: ImageCropFocus | Array<ImageCropFocus>
  quality: number
}): string {
  const args: Array<string> = []
  if (width) {
    args.push(`w=${width}`)
  }
  if (height) {
    args.push(`h=${height}`)
  }
  if (cropFocus) {
    args.push(`fit=crop`)
    args.push(
      `crop=${Array.isArray(cropFocus) ? cropFocus.join(`,`) : cropFocus}`
    )
  }
  args.push(`fm=${format}`)
  args.push(`q=${quality}`)

  return args.join(`&`)
}
