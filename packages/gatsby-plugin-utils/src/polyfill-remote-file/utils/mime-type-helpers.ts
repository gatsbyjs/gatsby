import mime from "mime"

export type ImageFormat = "jpg" | "png" | "webp" | "avif" | "auto"

export function getImageFormatFromMimeType(mimeType: string): ImageFormat {
  return mimeType
    .replace(`image/jpeg`, `image/jpg`)
    .replace(`image/`, ``) as ImageFormat
}

export function getFileExtensionFromMimeType(mimeType: string): string {
  // convert jpeg to jpg and make up extension if we return null
  return mime.getExtension(mimeType)?.replace(`jpeg`, `jpg`) ?? `gatsby`
}
