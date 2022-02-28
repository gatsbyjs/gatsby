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

  const { actions } = importFrom(
    global.__GATSBY?.root ?? process.cwd(),
    `gatsby/dist/redux/actions`
  ) as { actions: { createJobV2: (...args: any) => void } }

  // @ts-ignore - we dont have correct typings for this
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
  },
  actions: Actions
): void {
  const GATSBY_VERSION = getGatsbyVersion()
  const publicUrl = generatePublicUrl({
    url,
    mimeType: `image/${extension}`,
  }).split(`/`)
  publicUrl.unshift(`public`)

  // We need to use import-from to remove circular dependency
  const { actions } = importFrom(
    global.__GATSBY?.root ?? process.cwd(),
    `gatsby/dist/redux/actions`
  ) as { actions: { createJobV2: (...args: any) => void } }

  // @ts-ignore - importFrom doesn't work with types
  actions.createJobV2(
    {
      name: `IMAGE_CDN`,
      inputPaths: [],
      outputDir: path.join(
        global.__GATSBY?.root || process.cwd(),
        ...publicUrl.filter(Boolean),
        generateImageArgs({ width, height, format, quality })
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
