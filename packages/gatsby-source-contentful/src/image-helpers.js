// @ts-check
import crypto from "crypto"
import fs from "fs"
import path from "path"

import qs from "qs"

import { default as downloadWithRetry } from "./download-with-retry"
import cacheImage from "./cache-image"

if (process.env.GATSBY_REMOTE_CACHE) {
  console.warn(
    `Note: \`GATSBY_REMOTE_CACHE\` will be removed soon because it has been renamed to \`GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE\``
  )
}
if (process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE) {
  console.warn(
    `Please be aware that the \`GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE\` env flag is not officially supported and could be removed at any time`
  )
}

const REMOTE_CACHE_FOLDER =
  process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE ??
  process.env.GATSBY_REMOTE_CACHE ??
  path.join(process.cwd(), `.cache/remote_cache`)
export const CACHE_IMG_FOLDER = path.join(REMOTE_CACHE_FOLDER, `images`)

// @see https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-width-&-height
export const CONTENTFUL_IMAGE_MAX_SIZE = 4000

export const createUrl = (imgUrl, options = {}) => {
  // If radius is -1, we need to pass `max` to the API
  const cornerRadius =
    options.cornerRadius === -1 ? `max` : options.cornerRadius

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

  // Note: qs will ignore keys that are `undefined`. `qs.stringify({a: undefined, b: null, c: 1})` => `b=&c=1`
  return `${imgUrl}?${qs.stringify(urlArgs)}`
}

export const isImage = image =>
  [`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`].includes(
    image?.file?.contentType
  )

export const getBasicImageProps = (image, args) => {
  let aspectRatio
  if (args.width && args.height) {
    aspectRatio = args.width / args.height
  } else {
    aspectRatio =
      image.file.details.image.width / image.file.details.image.height
  }

  return {
    baseUrl: image.file.url,
    contentType: image.file.contentType,
    aspectRatio,
    width: image.file.details.image.width,
    height: image.file.details.image.height,
  }
}

// Promises that rejected should stay in this map. Otherwise remove promise and put their data in resolvedBase64Cache
const inFlightBase64Cache = new Map()
// This cache contains the resolved base64 fetches. This prevents async calls for promises that have resolved.
// The images are based on urls with w=20 and should be relatively small (<2kb) but it does stick around in memory
const resolvedBase64Cache = new Map()

// Note: this may return a Promise<body>, body (sync), or null
export const getBase64Image = (imageProps, reporter) => {
  if (!imageProps) {
    return null
  }

  // We only support images that are delivered through Contentful's Image API
  if (imageProps.baseUrl.indexOf(`images.ctfassets.net`) === -1) {
    return null
  }

  // Keep aspect ratio, image format and other transform options
  const { aspectRatio } = imageProps
  const originalFormat = imageProps.image.file.contentType.split(`/`)[1]
  const toFormat = imageProps.options.toFormat
  const imageOptions = {
    ...imageProps.options,
    toFormat,
    width: 20,
    height: Math.floor(20 / aspectRatio),
  }
  const requestUrl = `https:${createUrl(imageProps.baseUrl, imageOptions)}`

  // Prefer to return data sync if we already have it
  const alreadyFetched = resolvedBase64Cache.get(requestUrl)
  if (alreadyFetched) {
    return alreadyFetched
  }

  // If already in flight for this url return the same promise as the first call
  const inFlight = inFlightBase64Cache.get(requestUrl)
  if (inFlight) {
    return inFlight
  }

  // Note: sha1 is unsafe for crypto but okay for this particular case
  const shasum = crypto.createHash(`sha1`)
  shasum.update(requestUrl)
  const urlSha = shasum.digest(`hex`)

  // TODO: Find the best place for this step. This is definitely not it.
  fs.mkdirSync(CACHE_IMG_FOLDER, { recursive: true })

  const cacheFile = path.join(CACHE_IMG_FOLDER, urlSha + `.base64`)

  if (fs.existsSync(cacheFile)) {
    // TODO: against dogma, confirm whether readFileSync is indeed slower
    const promise = fs.promises.readFile(cacheFile, `utf8`)
    inFlightBase64Cache.set(requestUrl, promise)
    return promise.then(body => {
      inFlightBase64Cache.delete(requestUrl)
      resolvedBase64Cache.set(requestUrl, body)
      return body
    })
  }

  const loadImage = async () => {
    const imageResponse = await downloadWithRetry(
      {
        url: requestUrl,
        responseType: `arraybuffer`,
      },
      reporter
    )

    const base64 = Buffer.from(imageResponse.data, `binary`).toString(`base64`)

    const body = `data:image/${toFormat || originalFormat};base64,${base64}`

    try {
      // TODO: against dogma, confirm whether writeFileSync is indeed slower
      await fs.promises.writeFile(cacheFile, body)
      return body
    } catch (e) {
      console.error(
        `Contentful:getBase64Image: failed to write ${body.length} bytes remotely fetched from \`${requestUrl}\` to: \`${cacheFile}\`\nError: ${e}`
      )
      throw e
    }
  }

  const promise = loadImage()

  inFlightBase64Cache.set(requestUrl, promise)

  return promise.then(body => {
    inFlightBase64Cache.delete(requestUrl)
    resolvedBase64Cache.set(requestUrl, body)
    return body
  })
}

export const getTracedSVG = async (imageData, { store, reporter }) => {
  const { traceSVG } = require(`gatsby-plugin-sharp`)

  const { image, options } = imageData
  const {
    file: { contentType },
  } = image

  if (contentType.indexOf(`image/`) !== 0) {
    return null
  }

  const absolutePath = await cacheImage(store, image, options, reporter)
  const extension = path.extname(absolutePath)

  return traceSVG({
    file: {
      internal: image.internal,
      name: image.file.fileName,
      extension,
      absolutePath,
    },
    args: { toFormat: `` },
    fileArgs: options,
  })
}
