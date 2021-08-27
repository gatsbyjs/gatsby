// @ts-check
const fs = require(`fs`)
const path = require(`path`)
const crypto = require(`crypto`)

const sortBy = require(`lodash/sortBy`)
const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLJSON,
  GraphQLList,
} = require(`gatsby/graphql`)
const qs = require(`qs`)
const { stripIndent } = require(`common-tags`)

const cacheImage = require(`./cache-image`)
const downloadWithRetry = require(`./download-with-retry`).default
const {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
  ImageLayoutType,
  ImagePlaceholderType,
} = require(`./schemes`)

// By default store the images in `.cache` but allow the user to override
// and store the image cache away from the gatsby cache. After all, the gatsby
// cache is more likely to go stale than the images (which never go stale)
// Note that the same image might be requested multiple times in the same run

// Supported Image Formats from https://www.contentful.com/developers/docs/references/images-api/#/reference/changing-formats/image-format
const validImageFormats = new Set([`jpg`, `png`, `webp`, `gif`])

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
const CACHE_IMG_FOLDER = path.join(REMOTE_CACHE_FOLDER, `images`)

// Promises that rejected should stay in this map. Otherwise remove promise and put their data in resolvedBase64Cache
const inFlightBase64Cache = new Map()
// This cache contains the resolved base64 fetches. This prevents async calls for promises that have resolved.
// The images are based on urls with w=20 and should be relatively small (<2kb) but it does stick around in memory
const resolvedBase64Cache = new Map()

// @see https://www.contentful.com/developers/docs/references/images-api/#/reference/resizing-&-cropping/specify-width-&-height
const CONTENTFUL_IMAGE_MAX_SIZE = 4000

const isImage = image =>
  [`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`].includes(
    image?.file?.contentType
  )

// Note: this may return a Promise<body>, body (sync), or null
const getBase64Image = (imageProps, reporter) => {
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
exports.getBase64Image = getBase64Image

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

const createUrl = (imgUrl, options = {}) => {
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
exports.createUrl = createUrl

const generateImageSource = (
  filename,
  width,
  height,
  toFormat,
  _fit, // We use resizingBehavior instead
  {
    jpegProgressive,
    quality,
    cropFocus,
    backgroundColor,
    resizingBehavior,
    cornerRadius,
  }
) => {
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

const resolveFixed = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If no dimension is given, set a default width
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  }

  // If only a height is given, calculate the width based on the height and the aspect ratio
  if (options.height !== undefined && options.width === undefined) {
    options.width = Math.round(options.height * desiredAspectRatio)
  }

  // If we're cropping, calculate the specified aspect ratio.
  if (options.width !== undefined && options.height !== undefined) {
    desiredAspectRatio = options.width / options.height
  }

  // If the user selected a height and width (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.width !== undefined && options.height !== undefined) {
    if (!options.resizingBehavior) {
      options.resizingBehavior = `fill`
    }
  }

  // Create sizes (in width) for the image. If the width of the
  // image is 800px, the sizes would then be: 800, 1200, 1600,
  // 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution
  let fixedSizes = []
  fixedSizes.push(options.width)
  fixedSizes.push(options.width * 1.5)
  fixedSizes.push(options.width * 2)
  fixedSizes.push(options.width * 3)
  fixedSizes = fixedSizes.map(Math.round)

  // Filter out sizes larger than the image's width and the contentful image's max size.
  const filteredSizes = fixedSizes.filter(size => {
    const calculatedHeight = Math.round(size / desiredAspectRatio)
    return (
      size <= CONTENTFUL_IMAGE_MAX_SIZE &&
      calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
      size <= width
    )
  })

  // Sort sizes for prettiness.
  const sortedSizes = sortBy(filteredSizes)

  // Create the srcSet.
  const srcSet = sortedSizes
    .map((size, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `1x`
          break
        case 1:
          resolution = `1.5x`
          break
        case 2:
          resolution = `2x`
          break
        case 3:
          resolution = `3x`
          break
        default:
      }
      const h = Math.round(size / desiredAspectRatio)
      return `${createUrl(baseUrl, {
        ...options,
        width: size,
        height: h,
      })} ${resolution}`
    })
    .join(`,\n`)

  let pickedHeight
  let pickedWidth
  if (options.height) {
    pickedHeight = options.height
    pickedWidth = options.height * desiredAspectRatio
  } else {
    pickedHeight = options.width / desiredAspectRatio
    pickedWidth = options.width
  }

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    width: Math.round(pickedWidth),
    height: Math.round(pickedHeight),
    src: createUrl(baseUrl, {
      ...options,
      width: options.width,
    }),
    srcSet,
  }
}
exports.resolveFixed = resolveFixed

const resolveFluid = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If no dimension is given, set a default maxWidth
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  }

  // If only a maxHeight is given, calculate the maxWidth based on the height and the aspect ratio
  if (options.maxHeight !== undefined && options.maxWidth === undefined) {
    options.maxWidth = Math.round(options.maxHeight * desiredAspectRatio)
  }

  // If we're cropping, calculate the specified aspect ratio.
  if (options.maxHeight !== undefined && options.maxWidth !== undefined) {
    desiredAspectRatio = options.maxWidth / options.maxHeight
  }

  // If the users didn't set a default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${options.maxWidth}px) 100vw, ${options.maxWidth}px`
  }

  // Create sizes (in width) for the image. If the max width of the container
  // for the rendered markdown file is 800px, the sizes would then be: 200,
  // 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution
  let fluidSizes = []
  fluidSizes.push(options.maxWidth / 4)
  fluidSizes.push(options.maxWidth / 2)
  fluidSizes.push(options.maxWidth)
  fluidSizes.push(options.maxWidth * 1.5)
  fluidSizes.push(options.maxWidth * 2)
  fluidSizes.push(options.maxWidth * 3)
  fluidSizes = fluidSizes.map(Math.round)

  // Filter out sizes larger than the image's maxWidth and the contentful image's max size.
  const filteredSizes = fluidSizes.filter(size => {
    const calculatedHeight = Math.round(size / desiredAspectRatio)
    return (
      size <= CONTENTFUL_IMAGE_MAX_SIZE &&
      calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
      size <= width
    )
  })

  // Add the original image (if it isn't already in there) to ensure the largest image possible
  // is available for small images.
  if (
    !filteredSizes.includes(width) &&
    width < CONTENTFUL_IMAGE_MAX_SIZE &&
    Math.round(width / desiredAspectRatio) < CONTENTFUL_IMAGE_MAX_SIZE
  ) {
    filteredSizes.push(width)
  }

  // Sort sizes for prettiness.
  const sortedSizes = sortBy(filteredSizes)

  // Create the srcSet.
  const srcSet = sortedSizes
    .map(width => {
      const h = Math.round(width / desiredAspectRatio)
      return `${createUrl(image.file.url, {
        ...options,
        width,
        height: h,
      })} ${Math.round(width)}w`
    })
    .join(`,\n`)

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    src: createUrl(baseUrl, {
      ...options,
      width: options.maxWidth,
      height: options.maxHeight,
    }),
    srcSet,
    sizes: options.sizes,
  }
}
exports.resolveFluid = resolveFluid

const resolveResize = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, aspectRatio } = getBasicImageProps(image, options)

  // If no dimension is given, set a default width
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  }

  // If the user selected a height and width (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.width !== undefined && options.height !== undefined) {
    if (!options.resizingBehavior) {
      options.resizingBehavior = `fill`
    }
  }

  let pickedHeight = options.height
  let pickedWidth = options.width

  if (pickedWidth === undefined) {
    pickedWidth = pickedHeight * aspectRatio
  }

  if (pickedHeight === undefined) {
    pickedHeight = pickedWidth / aspectRatio
  }

  return {
    src: createUrl(image.file.url, options),
    width: Math.round(pickedWidth),
    height: Math.round(pickedHeight),
    aspectRatio,
    baseUrl,
  }
}

exports.resolveResize = resolveResize

const fixedNodeType = ({ name, getTracedSVG, reporter }) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: {
          type: GraphQLString,
          resolve: imageProps => getBase64Image(imageProps, reporter),
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: getTracedSVG,
        },
        aspectRatio: { type: GraphQLFloat },
        width: { type: new GraphQLNonNull(GraphQLFloat) },
        height: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return fixed?.src
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return fixed?.srcSet
          },
        },
      },
    }),
    args: {
      width: {
        type: GraphQLInt,
      },
      height: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: null,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
    },
    resolve(image, options, context) {
      const node = resolveFixed(image, options)
      if (!node) return null

      return {
        ...node,
        image,
        options,
        context,
      }
    },
  }
}

const fluidNodeType = ({ name, getTracedSVG, reporter }) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: {
          type: GraphQLString,
          resolve: imageProps => getBase64Image(imageProps, reporter),
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: getTracedSVG,
        },
        aspectRatio: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return fluid?.src
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return fluid?.srcSet
          },
        },
        sizes: { type: new GraphQLNonNull(GraphQLString) },
      },
    }),
    args: {
      maxWidth: {
        type: GraphQLInt,
      },
      maxHeight: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: null,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
      sizes: {
        type: GraphQLString,
      },
    },
    resolve(image, options, context) {
      const node = resolveFluid(image, options)
      if (!node) return null

      return {
        ...node,
        image,
        options,
        context,
      }
    },
  }
}

exports.extendNodeType = ({ type, store, reporter }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const getTracedSVG = async args => {
    const { traceSVG } = require(`gatsby-plugin-sharp`)

    const { image, options } = args
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

  const fixedNode = fixedNodeType({
    name: `ContentfulFixed`,
    getTracedSVG,
    reporter,
  })

  const fluidNode = fluidNodeType({
    name: `ContentfulFluid`,
    getTracedSVG,
    reporter,
  })

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
        defaultValue: [``, `webp`],
      },
    })

    fieldConfig.type = GraphQLJSON

    fieldConfig.args.placeholder.defaultValue = `dominantColor`
    fieldConfig.args.layout.defaultValue = `constrained`

    return fieldConfig
  }

  return {
    fixed: fixedNode,
    fluid: fluidNode,
    gatsbyImageData: getGatsbyImageData(),
    resize: {
      type: new GraphQLObjectType({
        name: `ContentfulResize`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve: imageProps => getBase64Image(imageProps, reporter),
          },
          tracedSVG: {
            type: GraphQLString,
            resolve: getTracedSVG,
          },
          src: { type: GraphQLString },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
          aspectRatio: { type: GraphQLFloat },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
        },
        height: {
          type: GraphQLInt,
        },
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        resizingBehavior: {
          type: ImageResizingBehavior,
        },
        toFormat: {
          type: ImageFormatType,
          defaultValue: ``,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
        background: {
          type: GraphQLString,
          defaultValue: null,
        },
        cornerRadius: {
          type: GraphQLInt,
          defaultValue: 0,
          description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
        },
      },
      resolve(image, options) {
        return resolveResize(image, options)
      },
    },
  }
}
