import crypto from "crypto"
import { basename, extname } from "path"
import { URL } from "url"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import { isImage } from "../types"
import type {
  ImageCdnUrlGeneratorFn,
  ImageCdnSourceImage,
  ImageCdnTransformArgs,
  FileCdnUrlGeneratorFn,
} from "../types"
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

const frontendHostName = process.env.IMAGE_CDN_HOSTNAME || ``

let customImageCDNUrlGenerator: ImageCdnUrlGeneratorFn | undefined = undefined
let customFileCDNUrlGenerator: FileCdnUrlGeneratorFn | undefined = undefined

const preferDefault = (m: any): any => (m && m.default) || m

export function generateFileUrl(
  source: ImageCdnSourceImage,
  store?: Store
): string {
  const state = store?.getState()

  const pathPrefix = state?.program?.prefixPaths
    ? state?.config?.pathPrefix
    : ``

  if (global.__GATSBY?.fileCDNUrlGeneratorModulePath) {
    if (!customFileCDNUrlGenerator) {
      customFileCDNUrlGenerator = preferDefault(
        require(global.__GATSBY.fileCDNUrlGeneratorModulePath)
      ) as FileCdnUrlGeneratorFn
    }
    return customFileCDNUrlGenerator(source, pathPrefix)
  }

  const { url, filename } = source

  const fileExt = extname(filename)
  const filenameWithoutExt = basename(filename, fileExt)

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl(
      {
        url,
      },
      pathPrefix
    )}/${filenameWithoutExt}${fileExt}`
  )

  appendUrlParamToSearchParams(parsedURL.searchParams, url)

  return `${frontendHostName}${parsedURL.pathname}${parsedURL.search}`
}

export function generateImageUrl(
  source: ImageCdnSourceImage,
  imageArgs: ImageCdnTransformArgs,
  store?: Store
): string {
  const state = store?.getState()

  const pathPrefix = state?.program?.prefixPaths
    ? state?.config?.pathPrefix
    : ``

  if (global.__GATSBY?.imageCDNUrlGeneratorModulePath) {
    if (!customImageCDNUrlGenerator) {
      customImageCDNUrlGenerator = preferDefault(
        require(global.__GATSBY.imageCDNUrlGeneratorModulePath)
      ) as ImageCdnUrlGeneratorFn
    }
    return customImageCDNUrlGenerator(source, imageArgs, pathPrefix)
  }

  const filenameWithoutExt = basename(source.filename, extname(source.filename))
  const queryStr = generateImageArgs(imageArgs)

  const parsedURL = new URL(
    `${ORIGIN}${generatePublicUrl(source, pathPrefix)}/${createContentDigest(
      queryStr
    )}/${filenameWithoutExt}.${imageArgs.format}`
  )

  appendUrlParamToSearchParams(parsedURL.searchParams, source.url)
  parsedURL.searchParams.append(ImageCDNUrlKeys.ARGS, queryStr)
  parsedURL.searchParams.append(
    ImageCDNUrlKeys.CONTENT_DIGEST,
    source.internal.contentDigest
  )

  return `${frontendHostName}${parsedURL.pathname}${parsedURL.search}`
}

const routePrefix = process.env.IMAGE_CDN_ROUTE_PREFIX || `_gatsby`

function generatePublicUrl(
  {
    url,
    mimeType,
  }: {
    url: string
    mimeType?: string
  },
  pathPrefix: string
): string {
  const remoteUrl = createContentDigest(url)

  let publicUrl =
    pathPrefix +
    (mimeType && isImage({ mimeType })
      ? `/${routePrefix}/image/`
      : `/${routePrefix}/file/`)

  publicUrl += `${remoteUrl}`

  return publicUrl
}

function generateImageArgs({
  width,
  height,
  format,
  cropFocus,
  quality,
}: ImageCdnTransformArgs): string {
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
