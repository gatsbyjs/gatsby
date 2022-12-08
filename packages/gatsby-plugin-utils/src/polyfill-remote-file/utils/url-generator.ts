import crypto from "crypto"
import { basename, extname } from "path"
import { URL } from "url"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import { isImage } from "../types"
import type { ImageCropFocus, WidthOrHeight } from "../types"
import type { Store } from "gatsby"

// this is an arbitrary origin that we use #branding so we can construct a full url for the URL constructor
const ORIGIN = `https://gatsbyjs.com`

export enum ImageCDNUrlKeys {
  URL = `u`,
  ENCRYPTED_URL = `eu`,
  ARGS = `a`,
  CONTENT_DIGEST = `cd`,
}

function encryptImageCdnUrl(
  secretKey: string,
  iv: string,
  urlToEncrypt: string
): string {
  const randomPadding = crypto
    .randomBytes(crypto.randomInt(32, 64))
    .toString(`hex`)

  const toEncrypt = `${randomPadding}:${urlToEncrypt}`
  const cipher = crypto.createCipheriv(
    `aes-256-ctr`,
    Buffer.from(secretKey, `hex`),
    Buffer.from(iv, `hex`)
  )
  const encrypted = cipher.update(toEncrypt)
  const finalBuffer = Buffer.concat([encrypted, cipher.final()])

  return finalBuffer.toString(`hex`)
}

function appendUrlParamToSearchParams(
  searchParams: URLSearchParams,
  url: string
): void {
  const key = process.env.IMAGE_CDN_ENCRYPTION_SECRET_KEY || ``
  const iv = process.env.IMAGE_CDN_ENCRYPTION_IV || ``
  const shouldEncrypt = !!(iv && key)

  const paramName = shouldEncrypt
    ? ImageCDNUrlKeys.ENCRYPTED_URL
    : ImageCDNUrlKeys.URL

  const finalUrl = shouldEncrypt ? encryptImageCdnUrl(key, iv, url) : url

  searchParams.append(paramName, finalUrl)
}

export function generateFileUrl(
  {
    url,
    filename,
  }: {
    url: string
    filename: string
  },
  store?: Store
): string {
  const fileExt = extname(filename)
  const filenameWithoutExt = basename(filename, fileExt)

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl(
      {
        url,
      },
      store
    )}/${filenameWithoutExt}${fileExt}`
  )

  appendUrlParamToSearchParams(parsedURL.searchParams, url)

  return `${parsedURL.pathname}${parsedURL.search}`
}

export function generateImageUrl(
  source: {
    url: string
    mimeType: string
    filename: string
    internal: { contentDigest: string }
  },
  imageArgs: Parameters<typeof generateImageArgs>[0],
  store?: Store
): string {
  const filenameWithoutExt = basename(source.filename, extname(source.filename))
  const queryStr = generateImageArgs(imageArgs)

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl(source, store)}/${createContentDigest(
      queryStr
    )}/${filenameWithoutExt}.${imageArgs.format}`
  )

  appendUrlParamToSearchParams(parsedURL.searchParams, source.url)
  parsedURL.searchParams.append(ImageCDNUrlKeys.ARGS, queryStr)
  parsedURL.searchParams.append(
    ImageCDNUrlKeys.CONTENT_DIGEST,
    source.internal.contentDigest
  )

  return `${parsedURL.pathname}${parsedURL.search}`
}

function generatePublicUrl(
  {
    url,
    mimeType,
  }: {
    url: string
    mimeType?: string
  },
  store?: Store
): string {
  const state = store?.getState()

  const pathPrefix = state?.program?.prefixPaths
    ? state?.config?.pathPrefix
    : ``

  const remoteUrl = createContentDigest(url)

  let publicUrl =
    pathPrefix +
    (mimeType && isImage({ mimeType }) ? `/_gatsby/image/` : `/_gatsby/file/`)

  publicUrl += `${remoteUrl}`

  return publicUrl
}

function generateImageArgs({
  width,
  height,
  format,
  cropFocus,
  quality,
}: WidthOrHeight & {
  format: string
  cropFocus?: ImageCropFocus | Array<ImageCropFocus>
  quality: number
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
  args.push(`fm=${format}`)
  args.push(`q=${quality}`)

  return args.join(`&`)
}
