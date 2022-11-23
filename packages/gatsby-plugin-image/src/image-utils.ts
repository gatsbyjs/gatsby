import camelCase from "camelcase"
import type { IGatsbyImageData } from "./index"

const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2]
export const DEFAULT_BREAKPOINTS = [750, 1080, 1366, 1920]
export const EVERY_BREAKPOINT = [
  320, 654, 768, 1024, 1366, 1600, 1920, 2048, 2560, 3440, 3840, 4096,
]
const DEFAULT_FLUID_WIDTH = 800
const DEFAULT_FIXED_WIDTH = 800
const DEFAULT_ASPECT_RATIO = 4 / 3

export type Fit = "cover" | "fill" | "inside" | "outside" | "contain"

export type Layout = "fixed" | "fullWidth" | "constrained"
export type ImageFormat = "jpg" | "png" | "webp" | "avif" | "auto" | ""

/**
 * The minimal required reporter, as we don't want to import it from gatsby-cli
 */
export interface IReporter {
  warn(message: string): void
}

export interface ISharpGatsbyImageArgs {
  layout?: Layout
  formats?: Array<ImageFormat>
  placeholder?: "tracedSVG" | "dominantColor" | "blurred" | "none"
  tracedSVGOptions?: Record<string, unknown>
  width?: number
  height?: number
  aspectRatio?: number
  sizes?: string
  quality?: number
  transformOptions?: {
    fit?: Fit
    cropFocus?: number | string
    duotone?: {
      highlight: string
      shadow: string
      opacity?: number
    }
    grayscale?: boolean
    rotate?: number
    trim?: number
  }
  jpgOptions?: Record<string, unknown>
  pngOptions?: Record<string, unknown>
  webpOptions?: Record<string, unknown>
  avifOptions?: Record<string, unknown>
  blurredOptions?: { width?: number; toFormat?: ImageFormat }
  breakpoints?: Array<number>
  outputPixelDensities?: Array<number>
  backgroundColor?: string
}

export interface IImageSizeArgs {
  width?: number
  height?: number
  layout?: Layout
  filename: string
  outputPixelDensities?: Array<number>
  breakpoints?: Array<number>
  fit?: Fit
  reporter?: IReporter
  sourceMetadata: { width: number; height: number }
}

export interface IImageSizes {
  sizes: Array<number>
  presentationWidth: number
  presentationHeight: number
  aspectRatio: number
  unscaledWidth: number
}

export interface IImage {
  src: string
  width: number
  height: number
  format: ImageFormat
}

export interface IGatsbyImageHelperArgs {
  pluginName: string
  generateImageSource: (
    filename: string,
    width: number,
    height: number,
    format: ImageFormat,
    fit?: Fit,
    options?: Record<string, unknown>
  ) => IImage
  layout?: Layout
  formats?: Array<ImageFormat>
  filename: string
  placeholderURL?: string
  width?: number
  height?: number
  sizes?: string
  reporter?: IReporter
  sourceMetadata?: { width: number; height: number; format: ImageFormat }
  fit?: Fit
  options?: Record<string, unknown>
  breakpoints?: Array<number>
  backgroundColor?: string
  aspectRatio?: number
}

const warn = (message: string): void => console.warn(message)

const sortNumeric = (a: number, b: number): number => a - b

export const getSizes = (width: number, layout: Layout): string | undefined => {
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`

    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`

    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`

    default:
      return undefined
  }
}

export const getSrcSet = (images: Array<IImage>): string =>
  images.map(image => `${image.src} ${image.width}w`).join(`,\n`)

export function formatFromFilename(filename: string): ImageFormat | undefined {
  const dot = filename.lastIndexOf(`.`)
  if (dot !== -1) {
    const ext = filename.slice(dot + 1)
    if (ext === `jpeg`) {
      return `jpg`
    }
    if (ext.length === 3 || ext.length === 4) {
      return ext as ImageFormat
    }
  }
  return undefined
}

export function setDefaultDimensions(
  args: IGatsbyImageHelperArgs
): IGatsbyImageHelperArgs {
  let {
    layout = `constrained`,
    width,
    height,
    sourceMetadata,
    breakpoints,
    aspectRatio,
    formats = [`auto`, `webp`],
  } = args
  formats = formats.map(format => format.toLowerCase() as ImageFormat)
  layout = camelCase(layout) as Layout

  if (width && height) {
    return { ...args, formats, layout, aspectRatio: width / height }
  }
  if (sourceMetadata.width && sourceMetadata.height && !aspectRatio) {
    aspectRatio = sourceMetadata.width / sourceMetadata.height
  }

  if (layout === `fullWidth`) {
    width = width || sourceMetadata.width || breakpoints[breakpoints.length - 1]
    height = height || Math.round(width / (aspectRatio || DEFAULT_ASPECT_RATIO))
  } else {
    if (!width) {
      if (height && aspectRatio) {
        width = height * aspectRatio
      } else if (sourceMetadata.width) {
        width = sourceMetadata.width
      } else if (height) {
        width = Math.round(height / DEFAULT_ASPECT_RATIO)
      } else {
        width = DEFAULT_FIXED_WIDTH
      }
    }

    if (aspectRatio && !height) {
      height = Math.round(width / aspectRatio)
    } else if (!aspectRatio) {
      aspectRatio = width / height
    }
  }
  return { ...args, width, height, aspectRatio, layout, formats }
}

/**
 * Use this for getting an image for the blurred placeholder. This ensures the
 * aspect ratio and crop match the main image
 */
export function getLowResolutionImageURL(
  args: IGatsbyImageHelperArgs,
  width = 20
): string {
  args = setDefaultDimensions(args)
  const { generateImageSource, filename, aspectRatio } = args
  return generateImageSource(
    filename,
    width,
    Math.round(width / aspectRatio),
    args.sourceMetadata.format || `jpg`,
    args.fit,
    args.options
  )?.src
}

export function generateImageData(
  args: IGatsbyImageHelperArgs
): IGatsbyImageData {
  args = setDefaultDimensions(args)

  let {
    pluginName,
    sourceMetadata,
    generateImageSource,
    layout,
    fit,
    options,
    width,
    height,
    filename,
    reporter = { warn },
    backgroundColor,
    placeholderURL,
  } = args

  if (!pluginName) {
    reporter.warn(
      `[gatsby-plugin-image] "generateImageData" was not passed a plugin name`
    )
  }

  if (typeof generateImageSource !== `function`) {
    throw new Error(`generateImageSource must be a function`)
  }

  if (!sourceMetadata || (!sourceMetadata.width && !sourceMetadata.height)) {
    // No metadata means we let the CDN handle max size etc, aspect ratio etc
    sourceMetadata = {
      width,
      height,
      format: sourceMetadata?.format || formatFromFilename(filename) || `auto`,
    }
  } else if (!sourceMetadata.format) {
    sourceMetadata.format = formatFromFilename(filename)
  }

  const formats = new Set<ImageFormat>(args.formats)

  if (formats.size === 0 || formats.has(`auto`) || formats.has(``)) {
    formats.delete(`auto`)
    formats.delete(``)
    formats.add(sourceMetadata.format)
  }

  if (formats.has(`jpg`) && formats.has(`png`)) {
    reporter.warn(
      `[${pluginName}] Specifying both 'jpg' and 'png' formats is not supported. Using 'auto' instead`
    )
    if (sourceMetadata.format === `jpg`) {
      formats.delete(`png`)
    } else {
      formats.delete(`jpg`)
    }
  }

  const imageSizes = calculateImageSizes({ ...args, sourceMetadata })

  const result: IGatsbyImageData["images"] = {
    sources: [],
  }

  let sizes = args.sizes
  if (!sizes) {
    sizes = getSizes(imageSizes.presentationWidth, layout)
  }

  formats.forEach(format => {
    const images = imageSizes.sizes
      .map(size => {
        const imageSrc = generateImageSource(
          filename,
          size,
          Math.round(size / imageSizes.aspectRatio),
          format,
          fit,
          options
        )
        if (
          !imageSrc?.width ||
          !imageSrc.height ||
          !imageSrc.src ||
          !imageSrc.format
        ) {
          reporter.warn(
            `[${pluginName}] The resolver for image ${filename} returned an invalid value.`
          )
          return undefined
        }
        return imageSrc
      })
      .filter(Boolean)

    if (format === `jpg` || format === `png` || format === `auto`) {
      const unscaled =
        images.find(img => img.width === imageSizes.unscaledWidth) || images[0]

      if (unscaled) {
        result.fallback = {
          src: unscaled.src,
          srcSet: getSrcSet(images),
          sizes,
        }
      }
    } else {
      result.sources?.push({
        srcSet: getSrcSet(images),
        sizes,
        type: `image/${format}`,
      })
    }
  })

  const imageProps: Partial<IGatsbyImageData> = {
    images: result,
    layout,
    backgroundColor,
  }

  if (placeholderURL) {
    imageProps.placeholder = { fallback: placeholderURL }
  }

  switch (layout) {
    case `fixed`:
      imageProps.width = imageSizes.presentationWidth
      imageProps.height = imageSizes.presentationHeight
      break

    case `fullWidth`:
      imageProps.width = 1
      imageProps.height = 1 / imageSizes.aspectRatio
      break

    case `constrained`:
      imageProps.width = args.width || imageSizes.presentationWidth || 1
      imageProps.height = (imageProps.width || 1) / imageSizes.aspectRatio
  }

  return imageProps as IGatsbyImageData
}

const dedupeAndSortDensities = (values: Array<number>): Array<number> =>
  Array.from(new Set([1, ...values])).sort(sortNumeric)

export function calculateImageSizes(args: IImageSizeArgs): IImageSizes {
  const {
    width,
    height,
    filename,
    layout = `constrained`,
    sourceMetadata: imgDimensions,
    reporter = { warn },
    breakpoints = DEFAULT_BREAKPOINTS,
  } = args

  // check that all dimensions provided are positive
  const userDimensions = { width, height }
  const erroneousUserDimensions = Object.entries(userDimensions).filter(
    ([_, size]) => typeof size === `number` && size < 1
  )
  if (erroneousUserDimensions.length) {
    throw new Error(
      `Specified dimensions for images must be positive numbers (> 0). Problem dimensions you have are ${erroneousUserDimensions
        .map(dim => dim.join(`: `))
        .join(`, `)}`
    )
  }

  if (layout === `fixed`) {
    return fixedImageSizes(args)
  } else if (layout === `constrained`) {
    return responsiveImageSizes(args)
  } else if (layout === `fullWidth`) {
    return responsiveImageSizes({ breakpoints, ...args })
  } else {
    reporter.warn(
      `No valid layout was provided for the image at ${filename}. Valid image layouts are fixed, fullWidth, and constrained. Found ${layout}`
    )
    return {
      sizes: [imgDimensions.width],
      presentationWidth: imgDimensions.width,
      presentationHeight: imgDimensions.height,
      aspectRatio: imgDimensions.width / imgDimensions.height,
      unscaledWidth: imgDimensions.width,
    }
  }
}
export function fixedImageSizes({
  filename,
  sourceMetadata: imgDimensions,
  width,
  height,
  fit = `cover`,
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  reporter = { warn },
}: IImageSizeArgs): IImageSizes {
  let aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width,
      height,
      fit,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  }

  if (!width) {
    if (!height) {
      width = DEFAULT_FIXED_WIDTH
    } else {
      width = Math.round(height * aspectRatio)
    }
  } else if (!height) {
    height = Math.round(width / aspectRatio)
  }

  const originalWidth = width // will use this for presentationWidth, don't want to lose it
  const isTopSizeOverriden =
    imgDimensions.width < width || imgDimensions.height < (height as number)

  // If the image is smaller than requested, warn the user that it's being processed as such
  // print out this message with the necessary information before we overwrite it for sizing
  if (isTopSizeOverriden) {
    const fixedDimension = imgDimensions.width < width ? `width` : `height`
    reporter.warn(`
The requested ${fixedDimension} "${
      fixedDimension === `width` ? width : height
    }px" for the image ${filename} was larger than the actual image ${fixedDimension} of ${
      imgDimensions[fixedDimension]
    }px. If possible, replace the current image with a larger one.`)

    if (fixedDimension === `width`) {
      width = imgDimensions.width
      height = Math.round(width / aspectRatio)
    } else {
      height = imgDimensions.height
      width = height * aspectRatio
    }
  }

  const sizes = densities
    .filter(size => size >= 1) // remove smaller densities because fixed images don't need them
    .map(density => Math.round(density * (width as number)))
    .filter(size => size <= imgDimensions.width)

  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  }
}

export function responsiveImageSizes({
  sourceMetadata: imgDimensions,
  width,
  height,
  fit = `cover`,
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  breakpoints,
  layout,
}: IImageSizeArgs): IImageSizes {
  let sizes
  let aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width,
      height,
      fit,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  }

  // Case 1: width of height were passed in, make sure it isn't larger than the actual image
  width = width && Math.min(width, imgDimensions.width)
  height = height && Math.min(height, imgDimensions.height)

  // Case 2: neither width or height were passed in, use default size
  if (!width && !height) {
    width = Math.min(DEFAULT_FLUID_WIDTH, imgDimensions.width)
    height = width / aspectRatio
  }

  // if it still hasn't been found, calculate width from the derived height.
  // TS isn't smart enough to realise the type for height has been narrowed here
  if (!width) {
    width = (height as number) * aspectRatio
  }

  const originalWidth = width
  const isTopSizeOverriden =
    imgDimensions.width < width || imgDimensions.height < (height as number)
  if (isTopSizeOverriden) {
    width = imgDimensions.width
    height = imgDimensions.height
  }

  width = Math.round(width)

  if (breakpoints?.length > 0) {
    sizes = breakpoints.filter(size => size <= imgDimensions.width)

    // If a larger breakpoint has been filtered-out, add the actual image width instead
    if (
      sizes.length < breakpoints.length &&
      !sizes.includes(imgDimensions.width)
    ) {
      sizes.push(imgDimensions.width)
    }
  } else {
    sizes = densities.map(density => Math.round(density * (width as number)))
    sizes = sizes.filter(size => size <= imgDimensions.width)
  }

  // ensure that the size passed in is included in the final output
  if (layout === `constrained` && !sizes.includes(width)) {
    sizes.push(width)
  }
  sizes = sizes.sort(sortNumeric)
  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  }
}

export function getDimensionsAndAspectRatio(
  dimensions,
  options
): { width: number; height: number; aspectRatio: number } {
  // Calculate the eventual width/height of the image.
  const imageAspectRatio = dimensions.width / dimensions.height

  let width = options.width
  let height = options.height

  switch (options.fit) {
    case `fill`: {
      width = options.width ? options.width : dimensions.width
      height = options.height ? options.height : dimensions.height
      break
    }
    case `inside`: {
      const widthOption = options.width
        ? options.width
        : Number.MAX_SAFE_INTEGER
      const heightOption = options.height
        ? options.height
        : Number.MAX_SAFE_INTEGER

      width = Math.min(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.min(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }
    case `outside`: {
      const widthOption = options.width ? options.width : 0
      const heightOption = options.height ? options.height : 0

      width = Math.max(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.max(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }

    default: {
      if (options.width && !options.height) {
        width = options.width
        height = Math.round(options.width / imageAspectRatio)
      }

      if (options.height && !options.width) {
        width = Math.round(options.height * imageAspectRatio)
        height = options.height
      }
    }
  }

  return {
    width,
    height,
    aspectRatio: width / height,
  }
}
