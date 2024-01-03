import path from "path"
import { createReadStream, readFile, mkdtemp } from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import { createMutex } from "gatsby-core-utils/mutex"
import Queue from "fastq"
import getSharpInstance from "gatsby-sharp"
import { getCache } from "./utils/cache"
import { getImageFormatFromMimeType } from "./utils/mime-type-helpers"
import { getRequestHeadersForUrl } from "./utils/get-request-headers-for-url"

import type { IRemoteImageNode } from "./types"
import type { Store } from "gatsby"

export enum PlaceholderType {
  BLURRED = `blurred`,
  DOMINANT_COLOR = `dominantColor`,
  TRACED_SVG = `tracedSVG`,
}
interface IPlaceholderGenerationArgs {
  placeholderUrl: string | undefined
  originalUrl: string
  format: string
  width: number
  height: number
  id: string
  contentDigest: string
}

const QUEUE_CONCURRENCY = 10
const PLACEHOLDER_BASE64_WIDTH = 20
const PLACEHOLDER_QUALITY = 25
const PLACEHOLDER_DOMINANT_WIDTH = 200
const PLACEHOLDER_TRACED_WIDTH = 200

let tmpDir: string

let didShowTraceSVGRemovalWarning = false
const queue = Queue<
  undefined,
  {
    url: string
    contentDigest: string
    width: number
    height: number
    type: PlaceholderType
    store?: Store
  },
  string
  // eslint-disable-next-line consistent-return
>(async function (
  { url, contentDigest, width, height, type, store },
  cb
): Promise<void> {
  const sharp = await getSharpInstance()

  if (!tmpDir) {
    const cache = getCache()
    tmpDir = await mkdtemp(path.join(cache.directory, `placeholder-`))
  }

  const httpHeaders = getRequestHeadersForUrl(url, store)

  const filePath = await fetchRemoteFile({
    url,
    cacheKey: contentDigest,
    directory: tmpDir,
    httpHeaders,
  })

  if (type === PlaceholderType.TRACED_SVG) {
    if (!didShowTraceSVGRemovalWarning) {
      // we should not hit this code path, field resolver should fallback earlier, this is just in-case.
      // also this falls back to BLURRED because the shape is compatible. DOMINANT_COLOR is not compatible
      // and fallback to DOMINANT_COLOR need to happen very early on and not when already generating value
      console.warn(
        `"TRACED_SVG" placeholder is no longer supported, falling back to "BLURRED". See https://gatsby.dev/tracesvg-removal/`
      )
      didShowTraceSVGRemovalWarning = true
    }
    type = PlaceholderType.BLURRED
  }

  switch (type) {
    case PlaceholderType.BLURRED: {
      let buffer: Buffer

      try {
        const fileStream = createReadStream(filePath)
        const pipeline = sharp()
        fileStream.pipe(pipeline)
        buffer = await pipeline
          .resize(
            PLACEHOLDER_BASE64_WIDTH,
            Math.ceil(PLACEHOLDER_BASE64_WIDTH / (width / height))
          )
          .toBuffer()
      } catch (e) {
        buffer = await readFile(filePath)
      }

      return cb(null, `data:image/jpg;base64,${buffer.toString(`base64`)}`)
    }
    case PlaceholderType.DOMINANT_COLOR: {
      const fileStream = createReadStream(filePath)
      const pipeline = sharp({ failOn: `none` })
      fileStream.pipe(pipeline)
      const { dominant } = await pipeline.stats()

      return cb(
        null,
        dominant
          ? `rgb(${dominant.r},${dominant.g},${dominant.b})`
          : `rgba(0,0,0,0)`
      )
    }
  }
},
QUEUE_CONCURRENCY)

// eslint-disable-next-line consistent-return
export async function generatePlaceholder(
  source: IRemoteImageNode,
  placeholderType: PlaceholderType,
  store?: Store
): Promise<{ fallback?: string; backgroundColor?: string }> {
  switch (placeholderType) {
    case PlaceholderType.BLURRED: {
      return {
        fallback: await runPlaceholder({
          id: source.id,
          placeholderUrl: source.placeholderUrl,
          originalUrl: source.url,
          format: getImageFormatFromMimeType(source.mimeType),
          width: source.width,
          height: source.height,
          contentDigest: source.internal.contentDigest,
          type: PlaceholderType.BLURRED,
          placeholderOptions: {
            width: PLACEHOLDER_BASE64_WIDTH,
            quality: PLACEHOLDER_QUALITY,
          },
          store,
        }),
      }
    }
    case PlaceholderType.DOMINANT_COLOR: {
      return {
        backgroundColor: await runPlaceholder({
          id: source.id,
          placeholderUrl: source.placeholderUrl,
          originalUrl: source.url,
          format: getImageFormatFromMimeType(source.mimeType),
          width: source.width,
          height: source.height,
          contentDigest: source.internal.contentDigest,
          type: PlaceholderType.DOMINANT_COLOR,
          placeholderOptions: {
            width: PLACEHOLDER_DOMINANT_WIDTH,
            quality: PLACEHOLDER_QUALITY,
          },
          store,
        }),
      }
    }
    case PlaceholderType.TRACED_SVG: {
      return {
        fallback: await runPlaceholder({
          id: source.id,
          placeholderUrl: source.placeholderUrl,
          originalUrl: source.url,
          format: getImageFormatFromMimeType(source.mimeType),
          width: source.width,
          height: source.height,
          contentDigest: source.internal.contentDigest,
          type: PlaceholderType.TRACED_SVG,
          placeholderOptions: {
            width: PLACEHOLDER_TRACED_WIDTH,
            quality: PLACEHOLDER_QUALITY,
          },
          store,
        }),
      }
    }
  }
}

async function runPlaceholder({
  placeholderUrl,
  originalUrl,
  width,
  height,
  id,
  contentDigest,
  type,
  placeholderOptions,
  store,
}: IPlaceholderGenerationArgs & {
  type: PlaceholderType
  placeholderOptions: { width: number; quality: number }
  store?: Store
}): Promise<string> {
  const cache = getCache()
  const cacheKey = `image-cdn:${id}-${contentDigest}:${type}`
  let cachedValue = await cache.get(cacheKey)
  if (cachedValue) {
    return cachedValue
  }

  const mutex = createMutex(
    `gatsby-plugin-utils:placeholder:${id}-${contentDigest}`
  )
  await mutex.acquire()

  try {
    // check cache again after mutex is acquired
    cachedValue = await cache.get(cacheKey)
    if (cachedValue) {
      return cachedValue
    }

    let url = originalUrl
    if (placeholderUrl) {
      url = generatePlaceholderUrl({
        url: placeholderUrl,
        originalWidth: width,
        originalHeight: height,
        ...placeholderOptions,
      })
    }

    const result = await new Promise<string>((resolve, reject) => {
      queue.push(
        {
          url,
          contentDigest,
          width,
          height,
          type,
          store,
        },
        (err, result) => {
          if (err) {
            reject(err)
            return
          }

          resolve(result as string)
        }
      )
    })

    await cache.set(cacheKey, result)

    return result
  } finally {
    await mutex.release()
  }
}

function generatePlaceholderUrl({
  url,
  width,
  quality,
  originalWidth,
  originalHeight,
}: {
  url: string
  width: number
  quality: number
  originalWidth: number
  originalHeight: number
}): string {
  const aspectRatio = originalWidth / originalHeight

  return url
    .replaceAll(`%width%`, String(width))
    .replaceAll(`%height%`, Math.floor(width / aspectRatio).toString())
    .replaceAll(`%quality%`, String(quality))
}
