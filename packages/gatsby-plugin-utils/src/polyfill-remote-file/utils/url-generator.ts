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
  const remoteUrl = Buffer.from(url).toString(`base64`)

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
  aspectRatio,
}: WidthOrHeight & {
  format: string
  cropFocus?: ImageCropFocus | Array<ImageCropFocus>
  quality: number
  aspectRatio: number
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
  /**
   * @todo does our resolver allow us to pass "standard" aspect ratio format like 4:3 or just floats?
   */
  if (aspectRatio) {
    // crop must be set for aspectRatio to work
    if (!cropFocus) {
      args.push(`fit=crop`)
    }
    args.push(`ar=${aspectRatio}`)
  }
  args.push(`fm=${format}`)
  args.push(`q=${quality}`)

  return Buffer.from(args.join(`&`)).toString(`base64`)
}
