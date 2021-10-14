// @ts-check
import { stripIndent } from "common-tags"
import fs from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils"
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLJSON,
  GraphQLList,
} from "gatsby/graphql"
import sortBy from "lodash/sortBy"
import path from "path"
import { URLSearchParams } from "url"
import {
  ImageCropFocusType,
  ImageFormatType,
  ImageLayoutType,
  ImagePlaceholderType,
  ImageResizingBehavior,
} from "./schemes"

// By default store the images in `.cache` but allow the user to override
// and store the image cache away from the gatsby cache. After all, the gatsby
// cache is more likely to go stale than the images (which never go stale)
// Note that the same image might be requested multiple times in the same run

// Supported Image Formats from https://www.contentful.com/developers/docs/references/images-api/#/reference/changing-formats/image-format
const validImageFormats = new Set([`jpg`, `png`, `webp`, `gif`])

const mimeTypeExtensions = new Map([
  [`image/jpeg`, `.jpg`],
  [`image/jpg`, `.jpg`],
  [`image/gif`, `.gif`],
  [`image/png`, `.png`],
  [`image/webp`, `.webp`],
])

exports.mimeTypeExtensions = mimeTypeExtensions

const isImage = image => mimeTypeExtensions.has(image?.file?.contentType)

// Promises that rejected should stay in this map. Otherwise remove promise and put their data in resolvedBase64Cache
const inFlightBase64Cache = new Map()
// This cache contains the resolved base64 fetches. This prevents async calls for promises that have resolved.
// The images are based on urls with w=20 and should be relatively small (<2kb) but it does stick around in memory
const resolvedBase64Cache = new Map()

// @see https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-width-&-height
const CONTENTFUL_IMAGE_MAX_SIZE = 4000

// Note: this may return a Promise<body>, body (sync), or null
export const getBase64Image = (imageProps, cache) => {
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
    height: Math.floor(20 * aspectRatio),
  }

  const requestUrl = createUrl(imageProps.baseUrl, imageOptions)

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

  const loadImage = async () => {
    const {
      file: { contentType },
    } = imageProps.image

    const extension = mimeTypeExtensions.get(contentType)

    const absolutePath = await fetchRemoteFile({
      url: requestUrl,
      cache,
      ext: extension,
    })

    const base64 = (await fs.readFile(absolutePath)).toString(`base64`)
    return `data:image/${toFormat || originalFormat};base64,${base64}`
  }

  const promise = loadImage()
  inFlightBase64Cache.set(requestUrl, promise)

  return promise.then(body => {
    inFlightBase64Cache.delete(requestUrl)
    resolvedBase64Cache.set(requestUrl, body)
    return body
  })
}

const getBasicImageProps = (image, args) => {
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

  const searchParams = new URLSearchParams()
  for (const paramKey in urlArgs) {
    if (typeof urlArgs[paramKey] !== `undefined`) {
      searchParams.append(paramKey, urlArgs[paramKey] ?? ``)
    }
  }

  return `https:${imgUrl}?${searchParams.toString()}`
}

export const generateImageSource = (
  filename,
  width,
  height,
  toFormat,
  _fit, // We use resizingBehavior instead
  imageTransformOptions
) => {
  const {
    jpegProgressive,
    quality,
    cropFocus,
    backgroundColor,
    resizingBehavior,
    cornerRadius,
  } = imageTransformOptions
  // Ensure we stay within Contentfuls Image API limits
  if (width > CONTENTFUL_IMAGE_MAX_SIZE) {
    height = Math.floor((height / width) * CONTENTFUL_IMAGE_MAX_SIZE)
    width = CONTENTFUL_IMAGE_MAX_SIZE
  }

  if (height > CONTENTFUL_IMAGE_MAX_SIZE) {
    width = Math.floor((width / height) * CONTENTFUL_IMAGE_MAX_SIZE)
    height = CONTENTFUL_IMAGE_MAX_SIZE
  }

  if (!validImageFormats.has(toFormat)) {
    console.warn(
      `[gatsby-source-contentful] Invalid image format "${toFormat}". Supported types are jpg, png and webp"`
    )
    return undefined
  }

  const src = createUrl(filename, {
    width,
    height,
    toFormat,
    resizingBehavior,
    background: backgroundColor?.replace(`#`, `rgb:`),
    quality,
    jpegProgressive,
    cropFocus,
    cornerRadius,
  })
  return { width, height, format: toFormat, src }
}

const fitMap = new Map([
  [`pad`, `contain`],
  [`fill`, `cover`],
  [`scale`, `fill`],
  [`crop`, `cover`],
  [`thumb`, `cover`],
])

export async function setFieldsOnGraphQLNodeType({ type, cache }) {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const getTracedSVG = async args => {
    const { traceSVG } = await import(`gatsby-plugin-sharp`)

    const { image, options } = args
    const {
      file: { contentType, url: imgUrl, fileName },
    } = image

    if (contentType.indexOf(`image/`) !== 0) {
      return null
    }

    const extension = mimeTypeExtensions.get(contentType)
    const url = createUrl(imgUrl, options)
    const name = path.basename(fileName, extension)

    const absolutePath = await fetchRemoteFile({
      url,
      name,
      cache,
      ext: extension,
    })

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

  const getDominantColor = async ({ image, options }) => {
    let pluginSharp

    try {
      pluginSharp = await import(`gatsby-plugin-sharp`)
    } catch (e) {
      console.error(
        `[gatsby-source-contentful] Please install gatsby-plugin-sharp`,
        e
      )
      return `rgba(0,0,0,0.5)`
    }

    try {
      const {
        file: { contentType, url: imgUrl, fileName },
      } = image

      if (contentType.indexOf(`image/`) !== 0) {
        return null
      }

      // 256px should be enough to properly detect the dominant color
      if (!options.width) {
        options.width = 256
      }

      const extension = mimeTypeExtensions.get(contentType)
      const url = createUrl(imgUrl, options)
      const name = path.basename(fileName, extension)

      const absolutePath = await fetchRemoteFile({
        url,
        name,
        cache,
        ext: extension,
      })

      if (!(`getDominantColor` in pluginSharp)) {
        console.error(
          `[gatsby-source-contentful] Please upgrade gatsby-plugin-sharp`
        )
        return `rgba(0,0,0,0.5)`
      }

      return pluginSharp.getDominantColor(absolutePath)
    } catch (e) {
      console.error(
        `[gatsby-source-contentful] Could not getDominantColor from image`,
        e
      )
      return `rgba(0,0,0,0.5)`
    }
  }

  const resolveGatsbyImageData = async (image, options) => {
    if (!isImage(image)) return null

    const { generateImageData } = await import(`gatsby-plugin-image`)

    const { baseUrl, contentType, width, height } = getBasicImageProps(
      image,
      options
    )
    let [, format] = contentType.split(`/`)
    if (format === `jpeg`) {
      format = `jpg`
    }
    const imageProps = generateImageData({
      ...options,
      pluginName: `gatsby-source-contentful`,
      sourceMetadata: { width, height, format },
      filename: baseUrl,
      generateImageSource,
      fit: fitMap.get(options.resizingBehavior),
      options,
    })

    let placeholderDataURI = null

    if (options.placeholder === `dominantColor`) {
      imageProps.backgroundColor = await getDominantColor({
        image,
        options,
      })
    }

    if (options.placeholder === `blurred`) {
      placeholderDataURI = await getBase64Image(
        {
          baseUrl,
          image,
          options,
        },
        cache
      )
    }

    if (options.placeholder === `tracedSVG`) {
      placeholderDataURI = await getTracedSVG({
        image,
        options,
      })
    }

    if (placeholderDataURI) {
      imageProps.placeholder = { fallback: placeholderDataURI }
    }

    return imageProps
  }

  // gatsby-plugin-image
  const getGatsbyImageData = async () => {
    const { getGatsbyImageFieldConfig } = await import(
      `gatsby-plugin-image/graphql-utils`
    )

    const fieldConfig = getGatsbyImageFieldConfig(resolveGatsbyImageData, {
      jpegProgressive: {
        type: GraphQLBoolean,
        defaultValue: true,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      layout: {
        type: ImageLayoutType,
        description: stripIndent`
            The layout for the image.
            CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
            FIXED: A static image size, that does not resize according to the screen width
            FULL_WIDTH: The image resizes to fit its container, even if that is larger than the source image.
            Pass a value to "sizes" if the container is not the full width of the screen.
        `,
        defaultValue: `constrained`,
      },
      placeholder: {
        type: ImagePlaceholderType,
        description: stripIndent`
            Format of generated placeholder image, displayed while the main image loads.
            BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
            DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
            TRACED_SVG: a low-resolution traced SVG of the image.
            NONE: no placeholder. Set the argument "backgroundColor" to use a fixed background color.`,
        defaultValue: `dominantColor`,
      },
      formats: {
        type: GraphQLList(ImageFormatType),
        description: stripIndent`
            The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, and WEBP.
            The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
            not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
            both PNG and JPG is not supported and will be ignored.
        `,
        defaultValue: [``, `webp`],
      },
    })

    fieldConfig.type = GraphQLJSON

    return fieldConfig
  }

  const gatsbyImageData = await getGatsbyImageData()

  return {
    gatsbyImageData,
  }
}
