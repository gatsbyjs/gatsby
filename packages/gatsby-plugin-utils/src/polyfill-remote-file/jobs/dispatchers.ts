import path from "path"
import { actions } from "gatsby/dist/redux/actions"
import { getFileExtensionFromMimeType } from "../utils/mime-type-helpers"
import { getGatsbyVersion } from "../utils/get-gatsby-version"
import { generatePublicUrl, generateImageArgs } from "../utils/url-generator"
import type { Store } from "gatsby"
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
    mimeType,
    contentDigest,
  }: { url: string; mimeType: string; contentDigest: string },
  store: Store
): void {
  const GATSBY_VERSION = getGatsbyVersion()
  const publicUrl = generatePublicUrl({ url, mimeType }).split(`/`)
  const extension = getFileExtensionFromMimeType(mimeType)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const filename = publicUrl.pop()
  publicUrl.unshift(`public`)

  actions.createJobV2(
    {
      name: `FILE_CDN`,
      inputPaths: [],
      // we know it's an image so we just mimic an image
      outputDir: path.join(
        global.__GATSBY?.root || process.cwd(),
        publicUrl.filter(Boolean).join(`/`)
      ),
      args: {
        url,
        filename: `${filename}.${extension}`,
        contentDigest,
      },
    },
    {
      name: `gatsby`,
      version: GATSBY_VERSION,
      resolve: __dirname,
    }
  )(store.dispatch, store.getState)
}

export function dispatchLocalImageServiceJob(
  {
    url,
    extension,
    width,
    height,
    format,
    fit,
    contentDigest,
  }: {
    url: string
    extension: string
    width: number
    height: number
    format: string
    fit: ImageFit
    contentDigest: string
  },
  store: Store
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
        publicUrl.filter(Boolean).join(`/`)
      ),
      args: {
        url,
        filename:
          generateImageArgs({ width, height, format, fit }) + `.${extension}`,
        width,
        height,
        format,
        fit,
        contentDigest,
      },
    },
    {
      name: `gatsby`,
      version: GATSBY_VERSION,
      resolve: __dirname,
    }
  )(store.dispatch, store.getState)
}
