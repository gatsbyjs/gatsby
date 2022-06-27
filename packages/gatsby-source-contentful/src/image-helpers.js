// @ts-check
import { URLSearchParams } from "url"

// Maximum value for size parameters in Contentful Image API
// @see https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-width-&-height
export const CONTENTFUL_IMAGE_MAX_SIZE = 4000

// Supported Image Formats by the Contentful Image API (https://www.contentful.com/developers/docs/references/images-api/#/reference/changing-formats/image-format)
export const validImageFormats = new Set([`jpg`, `png`, `webp`, `gif`, `avif`])

// Determine the proper file extension based on mime type
export const mimeTypeExtensions = new Map([
  [`image/jpeg`, `.jpg`],
  [`image/jpg`, `.jpg`],
  [`image/gif`, `.gif`],
  [`image/png`, `.png`],
  [`image/webp`, `.webp`],
  [`image/avif`, `.avif`],
])

// Check if Contentful asset is actually an image
export function isImage(image) {
  return mimeTypeExtensions.has(image?.file?.contentType)
}

// Create a Contentful Image API url
export function createUrl(imgUrl, options = {}) {
  // If radius is -1, we need to pass `max` to the API
  const cornerRadius =
    options.cornerRadius === -1 ? `max` : options.cornerRadius

  if (options.toFormat === `auto`) {
    delete options.toFormat
  }

  // Convert to Contentful names and filter out undefined/null values.
  const urlArgs = {
    w: options.width || undefined,
    h: options.height || undefined,
    fl:
      options.toFormat === `jpg` && options.jpegProgressive
        ? `progressive`
        : undefined,
    q: options.quality || undefined,
    fm: options.toFormat || undefined,
    fit: options.resizingBehavior || undefined,
    f: options.cropFocus || undefined,
    bg: options.background || undefined,
    r: cornerRadius || undefined,
  }

  const isBrowser = typeof window !== `undefined`

  const searchParams = isBrowser
    ? new window.URLSearchParams()
    : new URLSearchParams()

  for (const paramKey in urlArgs) {
    if (typeof urlArgs[paramKey] !== `undefined`) {
      searchParams.append(paramKey, urlArgs[paramKey] ?? ``)
    }
  }

  return `https:${imgUrl}?${searchParams.toString()}`
}
