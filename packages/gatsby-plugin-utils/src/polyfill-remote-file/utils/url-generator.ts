import { basename, extname } from "path"
import { URL } from "url"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import { isImage } from "../types"
import type { ImageCropFocus, WidthOrHeight } from "../types"

// this is an arbitrary origin that we use #branding so we can construct a full url for the URL constructor
const ORIGIN = `https://gatsbyjs.com`

export enum ImageCDNUrlKeys {
  URL = `u`,
  ARGS = `a`,
}

export function generateFileUrl({
  url,
  filename,
}: {
  url: string
  filename: string
}): string {
  const fileExt = extname(filename)
  const filenameWithoutExt = basename(filename, fileExt)

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl({
      url,
    })}/${filenameWithoutExt}${fileExt}`
  )

  parsedURL.searchParams.append(ImageCDNUrlKeys.URL, url)

  return `${parsedURL.pathname}${parsedURL.search}`
}

export function generateImageUrl(
  source: { url: string; mimeType: string; filename: string },
  imageArgs: Parameters<typeof generateImageArgs>[0]
): string {
  const filenameWithoutExt = basename(source.filename, extname(source.filename))

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl(source)}/${createContentDigest(
      generateImageArgs(imageArgs)
    )}/${filenameWithoutExt}.${imageArgs.format}`
  )

  parsedURL.searchParams.append(ImageCDNUrlKeys.URL, source.url)
  parsedURL.searchParams.append(
    ImageCDNUrlKeys.ARGS,
    generateImageArgs(imageArgs)
  )

  return `${parsedURL.pathname}${parsedURL.search}`
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
