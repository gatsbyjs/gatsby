/* eslint-disable no-unused-expressions */
import { IGatsbyImageData } from "gatsby-plugin-image"
import { GatsbyCache, Node } from "gatsby"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"
import { rgbToHex, calculateImageSizes, getSrcSet, getSizes } from "./utils"
import { traceSVG, getImageSizeAsync, base64, batchQueueImageResizing } from "."
import sharp from "./safe-sharp"
import { createTransformObject } from "./plugin-options"

const DEFAULT_BLURRED_IMAGE_WIDTH = 20

type ImageFormat = "jpg" | "png" | "webp" | "" | "auto"
export interface ISharpGatsbyImageArgs {
  layout?: "fixed" | "fluid" | "constrained"
  formats?: Array<ImageFormat>
  placeholder?: "tracedSVG" | "dominantColor" | "blurred" | "none"
  tracedSVGOptions?: Record<string, unknown>
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  sizes?: string
  quality?: number
  transformOptions: {
    fit?: "contain" | "cover" | "fill" | "inside" | "outside"
    cropFocus?: typeof sharp.strategy | typeof sharp.gravity | string
  }
  jpgOptions: Record<string, unknown>
  pngOptions: Record<string, unknown>
  webpOptions: Record<string, unknown>
  blurredOptions: { width?: number; toFormat?: ImageFormat }
}
export type FileNode = Node & {
  absolutePath?: string
  extension: string
}

export interface IImageMetadata {
  width?: number
  height?: number
  format?: string
  density?: number
  dominantColor?: string
}

const metadataCache = new Map<string, IImageMetadata>()

export async function getImageMetadata(
  file: FileNode,
  getDominantColor?: boolean
): Promise<IImageMetadata> {
  if (!getDominantColor) {
    // If we don't need the dominant color we can use the cheaper size function
    const { width, height, type } = await getImageSizeAsync(file)
    return { width, height, format: type }
  }
  let metadata = metadataCache.get(file.internal.contentDigest)
  if (metadata && process.env.NODE_ENV !== `test`) {
    return metadata
  }
  const pipeline = sharp(file.absolutePath)

  const { width, height, density, format } = await pipeline.metadata()

  const { dominant } = await pipeline.stats()
  // Fallback in case sharp doesn't support dominant
  const dominantColor = dominant
    ? rgbToHex(dominant.r, dominant.g, dominant.b)
    : `#000000`

  metadata = { width, height, density, format, dominantColor }
  metadataCache.set(file.internal.contentDigest, metadata)
  return metadata
}

export interface IImageDataProps {
  file: FileNode
  args: ISharpGatsbyImageArgs
  cache: GatsbyCache
  reporter: Reporter
}

export interface IImageDataArgs {
  file: FileNode
  args: ISharpGatsbyImageArgs
  pathPrefix: string
  cache: GatsbyCache
  reporter: Reporter
}

function normalizeFormat(format: string): ImageFormat {
  if (format === `jpeg`) {
    return `jpg`
  }
  return format as ImageFormat
}

export async function generateImageData({
  file,
  args,
  pathPrefix,
  reporter,
  cache,
}: IImageDataArgs): Promise<IGatsbyImageData | undefined> {
  const {
    layout = `constrained`,
    placeholder = `blurred`,
    tracedSVGOptions = {},
    transformOptions = {},
    quality,
  } = args

  args.formats = args.formats || [`auto`, `webp`]

  const {
    fit = `cover`,
    cropFocus = sharp.strategy.attention,
  } = transformOptions

  const metadata = await getImageMetadata(file, placeholder === `dominantColor`)

  if (layout === `fixed` && !args.width && !args.height) {
    args.width = metadata.width
  }

  if (
    layout !== `fixed` &&
    !args.maxWidth &&
    !args.maxHeight &&
    metadata.width
  ) {
    if (layout === `constrained`) {
      args.maxWidth = metadata.width
    } else if (layout === `fluid`) {
      args.maxWidth = Math.round(metadata.width / 2)
    }
  }

  const formats = new Set(args.formats)
  let useAuto = formats.has(``) || formats.has(`auto`) || formats.size === 0

  if (formats.has(`jpg`) && formats.has(`png`)) {
    reporter.warn(
      `Specifying both "jpg" and "png" formats is not supported and will be ignored. Please use "auto" instead.`
    )
    useAuto = true
  }

  let primaryFormat: ImageFormat | undefined
  let options: Record<string, unknown> | undefined
  if (useAuto) {
    primaryFormat = normalizeFormat(metadata.format || file.extension)
  } else if (formats.has(`png`)) {
    primaryFormat = `png`
    options = args.pngOptions
  } else if (formats.has(`jpg`)) {
    primaryFormat = `jpg`
    options = args.jpgOptions
  } else if (formats.has(`webp`)) {
    primaryFormat = `webp`
    options = args.webpOptions
  }

  const imageSizes: {
    sizes: Array<number>
    presentationWidth: number
    presentationHeight: number
    aspectRatio: number
    unscaledWidth: number
  } = calculateImageSizes({
    file,
    layout,
    ...args,
    imgDimensions: metadata,
    reporter,
  })

  const transforms = imageSizes.sizes.map(outputWidth => {
    const width = Math.round(outputWidth)
    const transform = createTransformObject({
      quality,
      ...transformOptions,
      fit,
      cropFocus,
      ...options,
      tracedSVGOptions,
      width,
      height: Math.round(width / imageSizes.aspectRatio),
      toFormat: primaryFormat,
    })

    if (pathPrefix) transform.pathPrefix = pathPrefix
    return transform
  })

  const images = batchQueueImageResizing({
    file,
    transforms,
    reporter,
  })

  const srcSet = getSrcSet(images)

  const sizes = args.sizes || getSizes(imageSizes.unscaledWidth, layout)

  const primaryIndex = imageSizes.sizes.findIndex(
    size => size === imageSizes.unscaledWidth
  )

  if (primaryIndex === -1) {
    reporter.error(
      `No image of the specified size found. Images may not have been processed correctly.`
    )
    return undefined
  }

  const primaryImage = images[primaryIndex]

  if (!images?.length) {
    return undefined
  }
  const imageProps: IGatsbyImageData = {
    layout,
    placeholder: undefined,
    images: {
      fallback: {
        src: primaryImage.src,
        srcSet,
        sizes,
      },
      sources: [],
    },
  }

  if (primaryFormat !== `webp` && formats.has(`webp`)) {
    const transforms = imageSizes.sizes.map(outputWidth => {
      const width = Math.round(outputWidth)
      const transform = createTransformObject({
        quality,
        ...transformOptions,
        fit,
        cropFocus,
        ...args.webpOptions,
        width,
        height: Math.round(width / imageSizes.aspectRatio),
        toFormat: `webp`,
      })
      return transform
    })

    const webpImages = batchQueueImageResizing({
      file,
      transforms,
      reporter,
    })
    const webpSrcSet = getSrcSet(webpImages)

    imageProps.images.sources?.push({
      srcSet: webpSrcSet,
      type: `image/webp`,
      sizes,
    })
  }

  if (placeholder === `blurred`) {
    const placeholderWidth =
      args.blurredOptions?.width || DEFAULT_BLURRED_IMAGE_WIDTH
    const { src: fallback } = await base64({
      file,
      args: {
        ...options,
        ...transformOptions,
        fit,
        cropFocus,
        toFormatBase64: args.blurredOptions?.toFormat,
        width: placeholderWidth,
        height: Math.round(placeholderWidth / imageSizes.aspectRatio),
      },
      reporter,
    })
    imageProps.placeholder = {
      fallback,
    }
  } else if (placeholder === `tracedSVG`) {
    const fallback: string = await traceSVG({
      file,
      args: tracedSVGOptions,
      fileArgs: args,
      cache,
      reporter,
    })
    imageProps.placeholder = {
      fallback,
    }
  } else if (metadata.dominantColor) {
    imageProps.backgroundColor = metadata.dominantColor
  }

  primaryImage.aspectRatio = primaryImage.aspectRatio || 1

  switch (layout) {
    case `fixed`:
      imageProps.width = imageSizes.presentationWidth
      imageProps.height = imageSizes.presentationHeight
      break

    case `fluid`:
      imageProps.width = 1
      imageProps.height = 1 / primaryImage.aspectRatio
      break

    case `constrained`:
      imageProps.width = args.maxWidth || primaryImage.width || 1
      imageProps.height = (imageProps.width || 1) / primaryImage.aspectRatio
  }
  return imageProps
}
