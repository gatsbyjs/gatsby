import { hasFeature } from "../../has-feature"
import { generateImageUrl } from "../utils/url-generator"
import { getImageFormatFromMimeType } from "../utils/mime-type-helpers"
import { stripIndent } from "../utils/strip-indent"
import {
  dispatchLocalImageServiceJob,
  shouldDispatchLocalImageServiceJob,
} from "../jobs/dispatchers"
import { generatePlaceholder, PlaceholderType } from "../placeholder-handler"
import { ImageCropFocus, isImage } from "../types"
import { validateAndNormalizeFormats, calculateImageDimensions } from "./utils"

import type { Actions, Store } from "gatsby"
import type {
  IRemoteFileNode,
  IRemoteImageNode,
  IGraphQLFieldConfigDefinition,
  ImageFormat,
  ImageLayout,
  CalculateImageSizesArgs,
} from "../types"
import type { getRemoteFileEnums } from "./get-remote-file-enums"

interface IGatsbyImageData {
  sources: Array<{
    srcSet: string
    type: string
    sizes: string
  }>
  fallback: {
    srcSet: string
    src: string
    sizes: string
  }
}

interface ISourceMetadata {
  width: number
  height: number
  format: ImageFormat
  filename: string
}

type IGatsbyImageDataArgs = Omit<
  CalculateImageSizesArgs,
  "fit" | "outputPixelDensities"
> & {
  formats?: Array<ImageFormat>
  backgroundColor?: string
  placeholder?: PlaceholderType | "none"
  aspectRatio?: number
  sizes?: string
  cropFocus?: Array<ImageCropFocus>
  fit?: CalculateImageSizesArgs["fit"]
  outputPixelDensities?: CalculateImageSizesArgs["outputPixelDensities"]
  quality?: number
}

type ImageSizeArgs = CalculateImageSizesArgs & {
  sourceMetadata: ISourceMetadata
}

interface IImageSizes {
  sizes: Array<number>
  presentationWidth: number
  presentationHeight: number
  aspectRatio: number
  unscaledWidth: number
}

const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2]
const DEFAULT_BREAKPOINTS = [750, 1080, 1366, 1920]
const DEFAULT_QUALITY = 75

const GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS = [`true`, `1`].includes(
  process.env.GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS || ``
)

let didShowTraceSVGRemovalWarning = false
export async function gatsbyImageResolver(
  source: IRemoteFileNode,
  args: IGatsbyImageDataArgs,
  actions: Actions,
  store?: Store
): Promise<{
  images: IGatsbyImageData
  layout: string
  width: number
  height: number
  backgroundColor?: string
  placeholder?: { fallback: string } | undefined
} | null> {
  if (!isImage(source)) {
    return null
  }

  if (!args.layout) {
    throw new Error(`The "layout" argument is required for "${source.url}"`)
  }

  if (!args.width && !args.height) {
    throw new Error(`
      Either the "width" or "height" argument is required for "${source.url}"
    `)
  }

  if (!args.formats) {
    args.formats = [`auto`, `webp`, `avif`]
  }

  if (!args.outputPixelDensities) {
    args.outputPixelDensities = DEFAULT_PIXEL_DENSITIES
  }

  if (!args.breakpoints) {
    args.breakpoints = DEFAULT_BREAKPOINTS
  }

  if (!args.fit) {
    args.fit = `cover`
  }

  if (!args.placeholder) {
    args.placeholder = PlaceholderType.DOMINANT_COLOR
  } else if (args.placeholder === PlaceholderType.TRACED_SVG) {
    if (!didShowTraceSVGRemovalWarning) {
      console.warn(
        `"TRACED_SVG" placeholder argument value is no longer supported (used in gatsbyImage processing), falling back to "DOMINANT_COLOR". See https://gatsby.dev/tracesvg-removal/`
      )
      didShowTraceSVGRemovalWarning = true
    }
    args.placeholder = PlaceholderType.DOMINANT_COLOR
  }

  if (!args.quality) {
    args.quality = DEFAULT_QUALITY
  }

  let backgroundColor = args.backgroundColor
  const sourceMetadata: ISourceMetadata = {
    width: source.width,
    height: source.height,
    format: getImageFormatFromMimeType(source.mimeType),
    filename: source.filename,
  }
  const formats = validateAndNormalizeFormats(
    args.formats,
    sourceMetadata.format
  )
  const imageSizes = calculateImageSizes(
    sourceMetadata,
    args as CalculateImageSizesArgs
  )
  const sizes = getSizesAttrFromLayout(
    args.layout,
    imageSizes.presentationWidth
  )
  const result: Partial<IGatsbyImageData> & {
    sources: IGatsbyImageData["sources"]
  } = {
    sources: [],
    fallback: undefined,
  }

  const getFormatValue = (format: ImageFormat): number => {
    if (format === `avif`) {
      return 3
    }
    if (format === `webp`) {
      return 2
    }

    return 1
  }

  const sortedFormats = Array.from(formats).sort(
    (a, b) => getFormatValue(b) - getFormatValue(a)
  )

  // Result will be used like this
  // <picture>
  // for each result.sources we create a <source srcset="..." /> tag
  // <img src="fallbacksrc" srcset="fallbacksrcset" />
  // </picture>
  for (const format of sortedFormats) {
    let fallbackSrc: string | undefined = undefined
    const images = imageSizes.sizes.map(width => {
      if (shouldDispatchLocalImageServiceJob()) {
        dispatchLocalImageServiceJob(
          {
            url: source.url,
            mimeType: source.mimeType,
            filename: source.filename,
            contentDigest: source.internal.contentDigest,
          },
          {
            width,
            height: Math.round(width / imageSizes.aspectRatio),
            format,
            cropFocus: args.cropFocus,
            quality: args.quality as number,
          },
          actions,
          store
        )
      }

      const src = generateImageUrl(
        source,
        {
          width,
          height: Math.round(width / imageSizes.aspectRatio),
          format,
          cropFocus: args.cropFocus,
          quality: args.quality as number,
        },
        store
      )

      if (!fallbackSrc) {
        fallbackSrc = src
      }

      return {
        src,
        descriptor:
          args.layout === `fixed`
            ? `${width / imageSizes.presentationWidth}x`
            : `${width}w`,
      }
    })

    // The latest format (by default will be jpg/png) is the fallback and doesn't need sources
    if (format === sortedFormats[sortedFormats.length - 1] && fallbackSrc) {
      result.fallback = {
        src: fallbackSrc,
        srcSet: createSrcSetFromImages(images),
        sizes,
      }
    } else {
      result.sources.push({
        srcSet: createSrcSetFromImages(images),
        type: `image/${format}`,
        sizes,
      })
    }
  }

  let placeholder: { fallback: string } | undefined
  if (args.placeholder !== `none`) {
    const { fallback, backgroundColor: bgColor } = await generatePlaceholder(
      source,
      args.placeholder as PlaceholderType,
      store
    )

    if (fallback) {
      placeholder = { fallback }
    }
    if (bgColor) {
      backgroundColor = bgColor
    }
  }

  // Check if addGatsbyImageSourceUrl for backwards compatibility with older Gatsby versions
  if (GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS && actions.addGatsbyImageSourceUrl) {
    actions.addGatsbyImageSourceUrl(source.url)
  }

  return {
    images: result as IGatsbyImageData,
    layout: args.layout,
    width: imageSizes.presentationWidth,
    height: imageSizes.presentationHeight,
    placeholder,
    backgroundColor,
  }
}

export function generateGatsbyImageFieldConfig(
  enums: ReturnType<typeof getRemoteFileEnums>,
  actions: Actions,
  store?: Store
): IGraphQLFieldConfigDefinition<
  IRemoteFileNode | IRemoteImageNode,
  ReturnType<typeof gatsbyImageResolver>,
  IGatsbyImageDataArgs
> {
  return {
    type: hasFeature(`graphql-typegen`) ? `GatsbyImageData` : `JSON`,
    description: `Data used in the <GatsbyImage /> component. See https://gatsby.dev/img for more info.`,
    args: {
      layout: {
        type: enums.layout.getTypeName(),
        description: stripIndent`
      The layout for the image.
      FIXED: A static image sized, that does not resize according to the screen width
      FULL_WIDTH: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen.
      CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
      `,
        defaultValue: enums.layout.getField(`CONSTRAINED`).value,
      },
      width: {
        type: `Int`,
        description: stripIndent`
  The display width of the generated image for layout = FIXED, and the display width of the largest image for layout = CONSTRAINED.
  The actual largest image resolution will be this value multiplied by the largest value in outputPixelDensities
  Ignored if layout = FLUID.
  `,
      },
      height: {
        type: `Int`,
        description: stripIndent`
  If set, the height of the generated image. If omitted, it is calculated from the supplied width, matching the aspect ratio of the source image.`,
      },
      placeholder: {
        type: enums.placeholder.getTypeName(),
        defaultValue: enums.placeholder.getField(`DOMINANT_COLOR`).value,
        description: stripIndent`
      Format of generated placeholder image, displayed while the main image loads.
      BLURRED: a blurred, low resolution image, encoded as a base64 data URI
      DOMINANT_COLOR: a solid color, calculated from the dominant color of the image (default).
      TRACED_SVG: deprecated. Will use DOMINANT_COLOR.
      NONE: no placeholder. Set the argument "backgroundColor" to use a fixed background color.`,
      },
      aspectRatio: {
        type: `Float`,
        description: stripIndent`
      If set along with width or height, this will set the value of the other dimension to match the provided aspect ratio, cropping the image if needed.
      If neither width or height is provided, height will be set based on the intrinsic width of the source image.
      `,
      },
      formats: {
        type: enums.format.NonNull.List.getTypeName(),
        description: stripIndent`
      The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, WEBP and AVIF.
      The default value is [AUTO, WEBP, AVIF], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
      not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
      both PNG and JPG is not supported and will be ignored.
  `,
        defaultValue: [
          enums.format.getField(`AUTO`).value,
          enums.format.getField(`WEBP`).value,
          enums.format.getField(`AVIF`).value,
        ],
      },
      outputPixelDensities: {
        type: `[Float]`,
        defaultValue: DEFAULT_PIXEL_DENSITIES,
        description: stripIndent`
      A list of image pixel densities to generate for FIXED and CONSTRAINED images. You should rarely need to change this. It will never generate images larger than the source, and will always include a 1x image.
      Default is [ 1, 2 ] for fixed images, meaning 1x, 2x, and [0.25, 0.5, 1, 2] for fluid. In this case, an image with a fluid layout and width = 400 would generate images at 100, 200, 400 and 800px wide.
      `,
      },
      breakpoints: {
        type: `[Int]`,
        defaultValue: DEFAULT_BREAKPOINTS,
        description: stripIndent`
  Specifies the image widths to generate. You should rarely need to change this. For FIXED and CONSTRAINED images it is better to allow these to be determined automatically,
  based on the image size. For FULL_WIDTH images this can be used to override the default, which is [750, 1080, 1366, 1920].
  It will never generate any images larger than the source.
  `,
      },
      sizes: {
        type: `String`,
        description: stripIndent`
      The "sizes" property, passed to the img tag. This describes the display size of the image.
      This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
      container will be the full width of the screen. In these cases we will generate an appropriate value.
  `,
      },
      backgroundColor: {
        type: `String`,
        description: `Background color applied to the wrapper, or when "letterboxing" an image to another aspect ratio.`,
      },
      fit: {
        type: enums.fit.getTypeName(),
        defaultValue: enums.fit.getField(`COVER`).value,
      },
      cropFocus: {
        type: enums.cropFocus.List.getTypeName(),
      },
      quality: {
        type: `Int`,
        defaultValue: DEFAULT_QUALITY,
      },
    },
    resolve(source, args): ReturnType<typeof gatsbyImageResolver> {
      return gatsbyImageResolver(source, args, actions, store)
    },
  }
}

function sortNumeric(a: number, b: number): number {
  return a - b
}

function createSrcSetFromImages(
  images: Array<{ src: string; descriptor: string }>
): string {
  return images.map(image => `${image.src} ${image.descriptor}`).join(`,`)
}

// eslint-disable-next-line consistent-return
function calculateImageSizes(
  sourceMetadata: ISourceMetadata,
  {
    width,
    height,
    layout,
    fit,
    outputPixelDensities,
    breakpoints,
    aspectRatio,
  }: CalculateImageSizesArgs
): IImageSizes {
  if (width && Number(width) <= 0) {
    throw new Error(
      `The provided width of "${width}" is incorrect. Dimensions should be a positive number.`
    )
  }

  if (height && Number(height) <= 0) {
    throw new Error(
      `The provided height of "${height}" is incorrect. Dimensions should be a positive number.`
    )
  }

  switch (layout) {
    case `fixed`: {
      return calculateFixedImageSizes({
        width,
        height,
        fit,
        sourceMetadata,
        outputPixelDensities,
        aspectRatio,
      })
    }
    case `constrained`: {
      // @ts-ignore - only width or height can be undefined but it doesn't let me type this correctly
      return calculateResponsiveImageSizes({
        sourceMetadata,
        width,
        height,
        fit,
        outputPixelDensities,
        layout,
        aspectRatio,
      })
    }
    case `fullWidth`: {
      // @ts-ignore - only width or height can be undefined but it doesn't let me type this correctly
      return calculateResponsiveImageSizes({
        sourceMetadata,
        width,
        height,
        fit,
        outputPixelDensities,
        layout,
        breakpoints,
        aspectRatio,
      })
    }
  }
}

function calculateFixedImageSizes({
  sourceMetadata,
  width,
  height,
  fit = `cover`,
  outputPixelDensities,
  aspectRatio: requestedAspectRatio,
}: Omit<ImageSizeArgs, "layout" | "breakpoints">): IImageSizes {
  let aspectRatio
  if (requestedAspectRatio) {
    aspectRatio = requestedAspectRatio
  } else {
    aspectRatio = sourceMetadata.width / sourceMetadata.height
  }

  // make sure output outputPixelDensities has a value of 1
  outputPixelDensities.push(1)
  const densities = new Set<number>(
    outputPixelDensities.sort(sortNumeric).filter(Boolean)
  )

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = calculateImageDimensions(sourceMetadata, {
      width,
      height,
      fit,
      aspectRatio,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  } else {
    // if we only get one value calculate the other value based on aspectRatio
    if (!width) {
      width = Math.round((height as number) * aspectRatio)
    } else {
      height = Math.round(width / aspectRatio)
    }
  }

  const presentationWidth = width // will use this for presentationWidth, don't want to lose it
  const isRequestedSizeLargerThanOriginal =
    sourceMetadata.width < width || sourceMetadata.height < (height as number)

  // If the image is smaller than requested, warn the user that it's being processed as such
  // print out this message with the necessary information before we overwrite it for sizing
  if (isRequestedSizeLargerThanOriginal) {
    const invalidDimension = sourceMetadata.width < width ? `width` : `height`
    console.warn(`
    The requested ${invalidDimension} "${
      invalidDimension === `width` ? width : height
    }px" for the image ${
      sourceMetadata.filename
    } was larger than the actual image ${invalidDimension} of ${
      sourceMetadata[invalidDimension]
    }px. If possible, replace the current image with a larger one.`)

    if (invalidDimension === `width`) {
      width = sourceMetadata.width
      height = width / aspectRatio
    } else {
      height = sourceMetadata.height
      width = height * aspectRatio
    }
  }

  const sizes = new Set<number>()
  for (const density of densities) {
    // Screen densities can only be higher or equal to 1
    if (density >= 1) {
      const widthFromDensity = density * width
      sizes.add(Math.min(widthFromDensity, sourceMetadata.width))
    }
  }

  return {
    sizes: Array.from(sizes),
    aspectRatio,
    presentationWidth,
    presentationHeight: Math.round(presentationWidth / aspectRatio),
    unscaledWidth: width,
  }
}

function calculateResponsiveImageSizes({
  sourceMetadata,
  width,
  height,
  fit = `cover`,
  outputPixelDensities,
  breakpoints,
  layout,
  aspectRatio: requestedAspectRatio,
}: ImageSizeArgs): IImageSizes {
  let sizes: Array<number> = []
  let aspectRatio
  if (requestedAspectRatio) {
    aspectRatio = requestedAspectRatio
  } else {
    aspectRatio = sourceMetadata.width / sourceMetadata.height
  }
  // Sort, dedupe and ensure there's a 1
  const densities = new Set<number>(
    outputPixelDensities.sort(sortNumeric).filter(Boolean)
  )

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = calculateImageDimensions(sourceMetadata, {
      width,
      height,
      fit,
      aspectRatio,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  } else {
    if (!width) {
      width = (height as number) / aspectRatio
    } else {
      height = width * aspectRatio
    }
  }

  // width of height were passed in, make sure it isn't larger than the actual image
  width = width ? Math.round(Math.min(width, sourceMetadata.width)) : undefined
  height = height ? Math.min(height, sourceMetadata.height) : undefined

  const nonNullableWidth = width as number
  const originalWidth = width as number

  if (breakpoints && breakpoints.length > 0) {
    sizes = breakpoints.filter(size => size <= sourceMetadata.width)

    // If a larger breakpoint has been filtered-out, add the actual image width instead
    if (
      sizes.length < breakpoints.length &&
      !sizes.includes(sourceMetadata.width)
    ) {
      sizes.push(sourceMetadata.width)
    }
  } else {
    sizes = Array.from(densities).map(density =>
      Math.round(density * nonNullableWidth)
    )
    sizes = sizes.filter(size => size <= sourceMetadata.width)
  }

  // ensure that the size passed in is included in the final output
  if (layout === `constrained` && !sizes.includes(nonNullableWidth)) {
    sizes.push(nonNullableWidth)
  }

  sizes = sizes.sort(sortNumeric)

  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: nonNullableWidth,
  }
}

// eslint-disable-next-line consistent-return
function getSizesAttrFromLayout(layout: ImageLayout, width: number): string {
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
  }
}
