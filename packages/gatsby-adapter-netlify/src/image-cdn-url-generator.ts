import type {
  ImageCdnUrlGeneratorFn,
  ImageCdnSourceImage,
  ImageCdnTransformArgs,
} from "gatsby"

export const generateImageUrl: ImageCdnUrlGeneratorFn =
  function generateImageUrl(
    source: ImageCdnSourceImage,
    imageArgs: ImageCdnTransformArgs
  ): string {
    const placeholderOrigin = `http://netlify.com`
    const imageParams = generateImageArgs(imageArgs)

    const baseURL = new URL(`${placeholderOrigin}/.netlify/images`)

    baseURL.search = imageParams.toString()
    baseURL.searchParams.append(`url`, source.url)
    baseURL.searchParams.append(`cd`, source.internal.contentDigest)

    return `${baseURL.pathname}${baseURL.search}`
  }

export function generateImageArgs({
  width,
  height,
  format,
  cropFocus,
  quality,
}: ImageCdnTransformArgs): URLSearchParams {
  const params = new URLSearchParams()

  if (width) {
    params.append(`w`, width.toString())
  }
  if (height) {
    params.append(`h`, height.toString())
  }
  if (cropFocus) {
    params.append(`fit`, `cover`)
    if (Array.isArray(cropFocus)) {
      // For array of cropFocus values, append them as comma-separated string
      params.append(`position`, cropFocus.join(`,`))
    } else {
      params.append(`position`, cropFocus)
    }
  }

  if (format) {
    params.append(`fm`, format)
  }

  if (quality) {
    params.append(`q`, quality.toString())
  }

  return params
}

export default generateImageUrl
