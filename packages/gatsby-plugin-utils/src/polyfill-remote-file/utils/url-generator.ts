import { isImage } from "../types"
import type { ImageFit, WidthOrHeight } from "../types"

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
  fit,
}: WidthOrHeight & { format: string; fit: ImageFit }): string {
  const args: Array<string> = []
  if (width) {
    args.push(`w=${width}`)
  }
  if (height) {
    args.push(`h=${height}`)
  }
  if (fit) {
    args.push(`fit=${fit}`)
  }
  if (format) {
    args.push(`fm=${format}`)
  }

  return Buffer.from(args.join(`&`)).toString(`base64`)
}
