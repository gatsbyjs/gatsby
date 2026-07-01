import type { FileCdnSourceImage, FileCdnUrlGeneratorFn } from "gatsby"

import { basename } from "path"
import { createHash } from "node:crypto"

function isImage(node: FileCdnSourceImage): boolean {
  return node.mimeType.startsWith(`image/`) && node.mimeType !== `image/svg+xml`
}

const placeholderOrigin = `http://netlify.com`

export const generateFileUrl: FileCdnUrlGeneratorFn = function generateFileUrl(
  source: FileCdnSourceImage,
  pathPrefix: string
): string {
  // use image cdn for images and file lambda for other files
  let baseURL: URL

  if (isImage(source)) {
    baseURL = new URL(`/.netlify/images`, placeholderOrigin)
    baseURL.searchParams.append(`url`, source.url)
    baseURL.searchParams.append(`cd`, source.internal.contentDigest)
  } else {
    baseURL = new URL(
      `${pathPrefix}/_gatsby/file/${createHash(`md5`)
        .update(source.url)
        .digest(`hex`)}/${basename(source.filename)}`,
      placeholderOrigin
    )

    baseURL.searchParams.append(`url`, source.url)
    baseURL.searchParams.append(`cd`, source.internal.contentDigest)
  }

  return `${baseURL.pathname}${baseURL.search}`
}

export default generateFileUrl
