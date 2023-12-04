import type { FileCdnUrlGeneratorFn, FileCdnSourceImage } from "gatsby"

export const generateImageUrl: FileCdnUrlGeneratorFn =
  function generateImageUrl(source: FileCdnSourceImage): string {
    const placeholderOrigin = `http://netlify.com`
    const baseURL = new URL(`${placeholderOrigin}/.netlify/images`)
    baseURL.searchParams.append(`url`, source.url)
    return `${baseURL.pathname}${baseURL.search}`
  }

export default generateImageUrl
