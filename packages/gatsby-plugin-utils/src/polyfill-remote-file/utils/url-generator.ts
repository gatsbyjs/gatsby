import { isImage } from "../types"
import type { ImageCropFocus, WidthOrHeight } from "../types"

export function generatePublicUrl({
  url,
  mimeType,
}: {
  url: string
  mimeType: string
}): string {
  const remoteUrl = Buffer.from(url).toString(`base64`)

  let publicUrl = isImage({ mimeType }) ? `/_gatsby/image/` : `/_gatsby/file/`
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

  return Buffer.from(args.join(`&`)).toString(`base64`)
}
