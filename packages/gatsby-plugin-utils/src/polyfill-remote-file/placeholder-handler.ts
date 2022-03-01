import path from "path"
import { createReadStream, readFile, mkdtemp } from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import { createMutex } from "gatsby-core-utils/mutex"
import Queue from "fastq"
import getSharpInstance from "gatsby-sharp"
import { getCache } from "./utils/cache"
import { getImageFormatFromMimeType } from "./utils/mime-type-helpers"
import type { IRemoteImageNode } from "./types"

export enum PlaceholderType {
  BLURRED = `blurred`,
  DOMINANT_COLOR = `dominantColor`,
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

let tmpDir: string

function getMutexKey(contentDigest: string): string {
  return `gatsby-plugin-utils:placeholder:${contentDigest}`
}

const queue = Queue<
  undefined,
  {
    url: string
    contentDigest: string
    width: number
    height: number
    type: PlaceholderType
  },
  string
  // eslint-disable-next-line consistent-return
>(async function (
  { url, contentDigest, width, height, type },
  cb
): Promise<void> {
  const sharp = await getSharpInstance()

  if (!tmpDir) {
    const cache = getCache()
    tmpDir = await mkdtemp(path.join(cache.directory, `placeholder-`))
  }

  const filePath = await fetchRemoteFile({
    url,
    cacheKey: contentDigest,
    directory: tmpDir,
  })

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
      const pipeline = sharp({ failOnError: false })
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
  placeholderType: PlaceholderType
): Promise<{ fallback?: string; backgroundColor?: string }> {
  switch (placeholderType) {
    case PlaceholderType.BLURRED: {
      return {
        fallback: await placeholderToBase64({
          id: source.id,
          placeholderUrl: source.placeholderUrl,
          originalUrl: source.url,
          format: getImageFormatFromMimeType(source.mimeType),
          width: source.width,
          height: source.height,
          contentDigest: source.internal.contentDigest,
        }),
      }
    }
    case PlaceholderType.DOMINANT_COLOR: {
      return {
        backgroundColor: await placeholderToDominantColor({
          id: source.id,
          placeholderUrl: source.placeholderUrl,
          originalUrl: source.url,
          format: getImageFormatFromMimeType(source.mimeType),
          width: source.width,
          height: source.height,
          contentDigest: source.internal.contentDigest,
        }),
      }
    }
  }
}

async function placeholderToBase64({
  placeholderUrl,
  originalUrl,
  width,
  height,
  id,
  contentDigest,
}: IPlaceholderGenerationArgs): Promise<string> {
  const cache = getCache()
  const cacheKey = `image-cdn:${id}-${contentDigest}:base64`
  let cachedValue = await cache.get(cacheKey)
  if (cachedValue) {
    return cachedValue
  }

  const mutex = createMutex(getMutexKey(`${id}-${contentDigest}`))
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
        width: PLACEHOLDER_BASE64_WIDTH,
        quality: PLACEHOLDER_QUALITY,
        originalWidth: width,
        originalHeight: height,
      })
    }

    const base64Placeholder = await new Promise<string>((resolve, reject) => {
      queue.push(
        {
          url,
          contentDigest,
          width,
          height,
          type: PlaceholderType.BLURRED,
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

    await cache.set(cacheKey, base64Placeholder)

    return base64Placeholder
  } finally {
    await mutex.release()
  }
}

async function placeholderToDominantColor({
  placeholderUrl,
  originalUrl,
  width,
  height,
  id,
  contentDigest,
}: IPlaceholderGenerationArgs): Promise<string> {
  const cache = getCache()
  const cacheKey = `image-cdn:${id}-${contentDigest}:dominantColor`
  let cachedValue = await cache.get(cacheKey)
  if (cachedValue) {
    return cachedValue
  }

  const mutex = createMutex(getMutexKey(`${id}-${contentDigest}`))
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
        width: 200,
        quality: PLACEHOLDER_QUALITY,
        originalWidth: width,
        originalHeight: height,
      })
    }

    const dominantColor = await new Promise<string>((resolve, reject) => {
      queue.push(
        {
          url,
          contentDigest,
          width,
          height,
          type: PlaceholderType.DOMINANT_COLOR,
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

    await cache.set(cacheKey, dominantColor)

    return dominantColor
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
    .replace(`%width%`, String(width))
    .replace(`%height%`, Math.floor(width / aspectRatio).toString())
    .replace(`%quality%`, String(quality))
}
