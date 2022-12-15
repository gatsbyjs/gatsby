/* eslint-disable no-unused-expressions */
import { IGatsbyImageData, ISharpGatsbyImageArgs } from "gatsby-plugin-image"
import { GatsbyCache, Node } from "gatsby"
import { Reporter } from "gatsby/reporter"
import fs from "fs-extra"
import { rgbToHex, calculateImageSizes, getSrcSet, getSizes } from "./utils"
import { traceSVG, getImageSizeAsync, base64, batchQueueImageResizing } from "."
import sharp from "./safe-sharp"
import {
  createTransformObject,
  getPluginOptions,
  mergeDefaults,
} from "./plugin-options"
import { reportError } from "./report-error"

const DEFAULT_BLURRED_IMAGE_WIDTH = 20

const DOMINANT_COLOR_IMAGE_SIZE = 200

const DEFAULT_BREAKPOINTS = [750, 1080, 1366, 1920]

type ImageFormat = "jpg" | "png" | "webp" | "avif" | "" | "auto"

export type FileNode = Node & {
  absolutePath: string
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
  getDominantColor?: boolean,
  cache?: GatsbyCache
): Promise<IImageMetadata> {
  if (!getDominantColor) {
    // If we don't need the dominant color we can use the cheaper size function
    const { width, height, type } = await getImageSizeAsync(file)
    return { width, height, format: type }
  }

  let metadata: IImageMetadata | undefined
  const METADATA_KEY = `metadata-${file.internal.contentDigest}`

  if (cache) {
    // Use plugin cache
    metadata = await cache.get(METADATA_KEY)
  } else {
    // Use in-memory cache instead
    metadata = metadataCache.get(METADATA_KEY)
  }
  if (metadata && process.env.NODE_ENV !== `test`) {
    return metadata
  }

  try {
    const pipeline = sharp({ failOn: getPluginOptions().failOn })

    fs.createReadStream(file.absolutePath).pipe(pipeline)

    const { width, height, density, format } = await pipeline.metadata()

    // Downsize the image before calculating the dominant color
    const buffer = await pipeline
      .resize(DOMINANT_COLOR_IMAGE_SIZE, DOMINANT_COLOR_IMAGE_SIZE, {
        fit: `inside`,
        withoutEnlargement: true,
      })
      .toBuffer()

    const { dominant } = await sharp(buffer).stats()

    // Fallback in case sharp doesn't support dominant
    const dominantColor = dominant
      ? rgbToHex(dominant.r, dominant.g, dominant.b)
      : `#000000`

    metadata = { width, height, density, format, dominantColor }
    if (cache) {
      await cache.set(METADATA_KEY, metadata)
    } else {
      metadataCache.set(METADATA_KEY, metadata)
    }
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err)
    return {}
  }

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

let didShowTraceSVGRemovalWarning = false
export async function generateImageData({
  file,
  args,
  pathPrefix,
  reporter,
  cache,
}: IImageDataArgs): Promise<IGatsbyImageData | undefined> {
  args = mergeDefaults(args)

  let {
    layout = `constrained`,
    placeholder = `dominantColor`,
    tracedSVGOptions = {},
    transformOptions = {},
    quality,
    backgroundColor,
  } = args

  args.formats = args.formats || [`auto`, `webp`]

  if (layout === `fullWidth`) {
    args.breakpoints = args.breakpoints?.length
      ? args.breakpoints
      : DEFAULT_BREAKPOINTS
  }

  if (placeholder === `tracedSVG`) {
    if (!didShowTraceSVGRemovalWarning) {
      console.warn(
        `"TRACED_SVG" placeholder argument value is no longer supported (used in gatsbyImageData processing), falling back to "DOMINANT_COLOR". See https://gatsby.dev/tracesvg-removal/`
      )
      didShowTraceSVGRemovalWarning = true
    }
    placeholder = `dominantColor`
  }

  const {
    fit = `cover`,
    cropFocus = sharp.strategy.attention,
    duotone,
  } = transformOptions

  if (duotone && (!duotone.highlight || !duotone.shadow)) {
    reporter.warn(
      `Invalid duotone option specified for ${file.absolutePath}, ignoring. Please pass an object to duotone with the keys "highlight" and "shadow" set to the corresponding hex values you want to use.`
    )
  }

  const metadata = await getImageMetadata(
    file,
    placeholder === `dominantColor`,
    cache
  )

  if ((args.width || args.height) && layout === `fullWidth`) {
    reporter.warn(
      `Specifying fullWidth images will ignore the width and height arguments, you may want a constrained image instead. Otherwise, use the breakpoints argument.`
    )
    args.width = metadata?.width
    args.height = undefined
  }

  if (!args.width && !args.height && metadata.width) {
    args.width = metadata.width
  }

  if (args.aspectRatio) {
    if (args.width && args.height) {
      reporter.warn(
        `Specifying aspectRatio along with both width and height will cause aspectRatio to be ignored.`
      )
    } else if (args.width) {
      args.height = args.width / args.aspectRatio
    } else if (args.height) {
      args.width = args.height * args.aspectRatio
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
  if (useAuto) {
    primaryFormat = normalizeFormat(metadata?.format || file.extension)
  } else if (formats.has(`png`)) {
    primaryFormat = `png`
  } else if (formats.has(`jpg`)) {
    primaryFormat = `jpg`
  } else if (formats.has(`webp`)) {
    primaryFormat = `webp`
  } else if (formats.has(`avif`)) {
    reporter.warn(
      `Image ${file.relativePath} specified only AVIF format, with no fallback format. This will mean your site cannot be viewed in all browsers.`
    )
    primaryFormat = `avif`
  }

  const optionsMap = {
    jpg: args.jpgOptions,
    png: args.pngOptions,
    webp: args.webpOptions,
    avif: args.avifOptions,
  }

  const options = primaryFormat ? optionsMap[primaryFormat] : undefined

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

  const sharedOptions = {
    quality,
    ...transformOptions,
    fit,
    cropFocus,
    background: backgroundColor,
  }

  const transforms = imageSizes.sizes.map(outputWidth => {
    const width = Math.round(outputWidth)
    const transform = createTransformObject({
      ...sharedOptions,
      ...options,
      width,
      height: Math.round(width / imageSizes.aspectRatio),
      toFormat: primaryFormat,
    })

    if (pathPrefix) {
      transform.pathPrefix = pathPrefix
    }
    return transform
  })

  const images = batchQueueImageResizing({
    file,
    transforms,
    reporter,
  })

  const srcSet = getSrcSet(images)

  const sizes = args.sizes || getSizes(imageSizes.unscaledWidth, layout)

  const primaryIndex =
    layout === `fullWidth`
      ? imageSizes.sizes.length - 1 // The largest image
      : imageSizes.sizes.findIndex(
          size => size === Math.round(imageSizes.unscaledWidth)
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
  const imageProps: Pick<
    IGatsbyImageData,
    "backgroundColor" | "layout" | "placeholder" | "images"
  > &
    Partial<Pick<IGatsbyImageData, "width" | "height">> = {
    layout,
    placeholder: undefined,
    backgroundColor,
    images: {
      fallback: {
        src: primaryImage.src,
        srcSet,
        sizes,
      },
      sources: [],
    },
  }

  if (primaryFormat !== `avif` && formats.has(`avif`)) {
    const transforms = imageSizes.sizes.map(outputWidth => {
      const width = Math.round(outputWidth)
      const transform = createTransformObject({
        ...sharedOptions,
        ...args.avifOptions,
        width,
        height: Math.round(width / imageSizes.aspectRatio),
        toFormat: `avif`,
      })
      if (pathPrefix) {
        transform.pathPrefix = pathPrefix
      }
      return transform
    })

    const avifImages = batchQueueImageResizing({
      file,
      transforms,
      reporter,
    })

    imageProps.images.sources?.push({
      srcSet: getSrcSet(avifImages),
      type: `image/avif`,
      sizes,
    })
  }

  if (primaryFormat !== `webp` && formats.has(`webp`)) {
    const transforms = imageSizes.sizes.map(outputWidth => {
      const width = Math.round(outputWidth)
      const transform = createTransformObject({
        ...sharedOptions,
        ...args.webpOptions,
        width,
        height: Math.round(width / imageSizes.aspectRatio),
        toFormat: `webp`,
      })
      if (pathPrefix) {
        transform.pathPrefix = pathPrefix
      }
      return transform
    })

    const webpImages = batchQueueImageResizing({
      file,
      transforms,
      reporter,
    })

    imageProps.images.sources?.push({
      srcSet: getSrcSet(webpImages),
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
        ...sharedOptions,
        ...options,
        toFormatBase64: args.blurredOptions?.toFormat,
        width: placeholderWidth,
        height: Math.max(
          1,
          Math.round(placeholderWidth / imageSizes.aspectRatio)
        ),
      },
      reporter,
    })
    imageProps.placeholder = {
      fallback,
    }
  } else if (metadata?.dominantColor) {
    imageProps.backgroundColor = metadata.dominantColor
  }

  primaryImage.aspectRatio = primaryImage.aspectRatio || 1

  switch (layout) {
    case `fixed`:
      imageProps.width = imageSizes.presentationWidth
      imageProps.height = imageSizes.presentationHeight
      break

    case `fullWidth`:
      imageProps.width = 1
      imageProps.height = 1 / primaryImage.aspectRatio
      break

    case `constrained`:
      imageProps.width = args.width || primaryImage.width || 1
      imageProps.height = (imageProps.width || 1) / primaryImage.aspectRatio
  }
  return imageProps as IGatsbyImageData
}
