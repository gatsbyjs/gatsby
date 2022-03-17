import md5 from "md5"
import { shouldDispatch } from "../jobs/dispatchers"
import { base64URLEncode } from "./base64"
import { isImage } from "../types"
import type { ImageCropFocus, WidthOrHeight } from "../types"

export function generatePublicUrl(
  {
    url,
    mimeType,
  }: {
    url: string
    mimeType: string
  },
  checkMimeType: boolean = true
): string {
  let remoteUrl = base64URLEncode(url)
  // if the image will be downloaded locally, then md5 the base64 encoded remote url to prevent path segments
  // that are longer than allowed
  if (shouldDispatch()) {
    remoteUrl = md5(remoteUrl)
  }

  let publicUrl =
    checkMimeType && isImage({ mimeType })
      ? `/_gatsby/image/`
      : `/_gatsby/file/`
  publicUrl += `${remoteUrl}`

  return publicUrl
}

export function generateImageArgs({
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

  let joinedArgs = base64URLEncode(args.join(`&`))
  if (shouldDispatch()) {
    joinedArgs = md5(joinedArgs)
  }

  return joinedArgs
}
