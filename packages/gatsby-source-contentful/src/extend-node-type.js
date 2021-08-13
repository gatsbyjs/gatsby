// @ts-check
const {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLJSON,
  GraphQLList,
} = require(`gatsby/graphql`)
const { stripIndent } = require(`common-tags`)
const cacheImage = require(`./cache-image`)
const {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
  ImageLayoutType,
  ImagePlaceholderType,
} = require(`./schemes`)

const {
  fixedNodeType,
  fluidNodeType,
  resizeNodeType,
} = require(`./gatsby-image`)

const {
  CONTENTFUL_IMAGE_MAX_SIZE,
  createUrl,
  getBase64Image,
  getBasicImageProps,
  getTracedSVG,
  isImage,
} = require(`./image-helpers`)

// By default store the images in `.cache` but allow the user to override
// and store the image cache away from the gatsby cache. After all, the gatsby
// cache is more likely to go stale than the images (which never go stale)
// Note that the same image might be requested multiple times in the same run

// Supported Image Formats from https://www.contentful.com/developers/docs/references/images-api/#/reference/changing-formats/image-format
const validImageFormats = new Set([`jpg`, `png`, `webp`, `gif`])

const generateImageSource = (
  filename,
  width,
  height,
  toFormat,
  _fit, // We use resizingBehavior instead
  options
) => {
  const imageFormatDefaults = options[`${toFormat}Options`]

  if (
    imageFormatDefaults &&
    Object.keys(imageFormatDefaults).length !== 0 &&
    imageFormatDefaults.constructor === Object
  ) {
    options = { ...options, ...imageFormatDefaults }
  }

  const {
    jpegProgressive,
    quality,
    cropFocus,
    backgroundColor,
    resizingBehavior,
    cornerRadius,
  } = options

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

exports.generateImageSource = generateImageSource

const fitMap = new Map([
  [`pad`, `contain`],
  [`fill`, `cover`],
  [`scale`, `fill`],
  [`crop`, `cover`],
  [`thumb`, `cover`],
])

exports.extendNodeType = ({ type, store, reporter }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const getDominantColor = async ({ image, options }) => {
    let pluginSharp

    try {
      pluginSharp = require(`gatsby-plugin-sharp`)
    } catch (e) {
      console.error(
        `[gatsby-source-contentful] Please install gatsby-plugin-sharp`,
        e
      )
      return `rgba(0,0,0,0.5)`
    }

    try {
      const absolutePath = await cacheImage(store, image, options, reporter)

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

    const { generateImageData } = require(`gatsby-plugin-image`)

    const {
      getPluginOptions,
      doMergeDefaults,
    } = require(`gatsby-plugin-sharp/plugin-options`)

    const sharpOptions = getPluginOptions()

    const userDefaults = sharpOptions.defaults

    const defaults = {
      tracedSVGOptions: {},
      blurredOptions: {},
      jpgOptions: {},
      pngOptions: {},
      webpOptions: {},
      // Note: Contentful does not support avif yet, but does support gif.
      gifOptions: {},
      ...userDefaults,
      quality: userDefaults.quality || 50,
      layout: userDefaults.layout || `constrained`,
      placeholder: userDefaults.placeholder || `dominantColor`,
      formats: userDefaults.formats || [``, `webp`],
    }

    options = doMergeDefaults(options, defaults)

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
        reporter
      )
    }

    if (options.placeholder === `tracedSVG`) {
      placeholderDataURI = await getTracedSVG(
        {
          image,
          options,
        },
        { store, reporter }
      )
    }

    if (placeholderDataURI) {
      imageProps.placeholder = { fallback: placeholderDataURI }
    }

    return imageProps
  }

  // gatsby-plugin-image
  const getGatsbyImageData = () => {
    const {
      getGatsbyImageFieldConfig,
    } = require(`gatsby-plugin-image/graphql-utils`)

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
      },
      placeholder: {
        type: ImagePlaceholderType,
        description: stripIndent`
            Format of generated placeholder image, displayed while the main image loads.
            BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
            DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
            TRACED_SVG: a low-resolution traced SVG of the image.
            NONE: no placeholder. Set the argument "backgroundColor" to use a fixed background color.`,
      },
      formats: {
        type: GraphQLList(ImageFormatType),
        description: stripIndent`
            The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, and WEBP.
            The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
            not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
            both PNG and JPG is not supported and will be ignored.
        `,
      },
    })

    fieldConfig.type = GraphQLJSON

    return fieldConfig
  }

  return {
    fixed: fixedNodeType({
      store,
      reporter,
    }),
    fluid: fluidNodeType({
      store,
      reporter,
    }),
    resize: resizeNodeType({
      store,
      reporter,
    }),
    gatsbyImageData: getGatsbyImageData(),
  }
}
