import path from "path"
import { getGatsbyVersion } from "../utils/get-gatsby-version"
import { generatePublicUrl, generateImageArgs } from "../utils/url-generator"
import type { Actions } from "gatsby"
import type { ImageFit } from "../types"

export function shouldDispatch(): boolean {
  return (
    !(
      process.env.GATSBY_CLOUD_IMAGE_CDN === `1` ||
      process.env.GATSBY_CLOUD_IMAGE_CDN === `true`
    ) && process.env.NODE_ENV === `production`
  )
}

export function dispatchLocalFileServiceJob(
  {
    url,
    filename,
    mimeType,
    contentDigest,
  }: { url: string; filename: string; mimeType: string; contentDigest: string },
  actions: Actions
): void {
  const GATSBY_VERSION = getGatsbyVersion()
  const publicUrl = generatePublicUrl(
    {
      url,
      // We always want file based url
      mimeType,
    },
    false
  ).split(`/`)

  publicUrl.unshift(`public`)

  actions.createJobV2(
    {
      name: `FILE_CDN`,
      inputPaths: [],
      // we know it's an image so we just mimic an image
      outputDir: path.join(
        global.__GATSBY?.root || process.cwd(),
        ...publicUrl.filter(Boolean)
      ),
      args: {
        url,
        filename,
        contentDigest,
      },
    },
    {
      name: `gatsby`,
      // @ts-ignore - version is allowed
      version: GATSBY_VERSION,
      resolve: __dirname,
    }
  )
}

export function dispatchLocalImageServiceJob(
  {
    url,
    extension,
    basename,
    width,
    height,
    format,
    fit,
    contentDigest,
    quality,
    aspectRatio,
  }: {
    url: string
    extension: string
    basename: string
    width: number
    height: number
    format: string
    fit: ImageFit
    contentDigest: string
    quality: number
    aspectRatio: number
  },
  actions: Actions
): void {
  const GATSBY_VERSION = getGatsbyVersion()
  const publicUrl = generatePublicUrl({
    url,
    mimeType: `image/${extension}`,
  }).split(`/`)
  publicUrl.unshift(`public`)

  actions.createJobV2(
    {
      name: `IMAGE_CDN`,
      inputPaths: [],
      outputDir: path.join(
        global.__GATSBY?.root || process.cwd(),
        ...publicUrl.filter(Boolean),
        generateImageArgs({ width, height, format, quality, aspectRatio })
      ),
      args: {
        url,
        filename: `${basename}.${extension}`,
        width,
        height,
        format,
        fit,
        quality,
        contentDigest,
      },
    },
    {
      name: `gatsby`,
      // @ts-ignore - version is allowed
      version: GATSBY_VERSION,
      resolve: __dirname,
    }
  )
}
