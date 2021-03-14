const _ = require(`lodash`)

/// Plugin options are loaded onPreBootstrap in gatsby-node
const pluginDefaults = {
  base64Width: 20,
  forceBase64Format: ``, // valid formats: png,jpg,webp
  useMozJpeg: process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`,
  stripMetadata: true,
  lazyImageGeneration: true,
  defaultQuality: 50,
  failOnError: true, // matches default of the sharp api constructor (https://sharp.pixelplumbing.com/api-constructor)
}

const generalArgs = {
  quality: 50,
  jpegQuality: null,
  pngQuality: null,
  webpQuality: null,
  jpegProgressive: true,
  pngCompressionLevel: 9,
  // default is 4 (https://github.com/kornelski/pngquant/blob/4219956d5e080be7905b5581314d913d20896934/rust/bin.rs#L61)
  pngCompressionSpeed: 4,
  base64: true,
  grayscale: false,
  duotone: false,
  pathPrefix: ``,
  toFormat: ``,
  toFormatBase64: ``,
  sizeByPixelDensity: false,
  rotate: 0,
}

let pluginOptions = Object.assign({}, pluginDefaults)
exports.setPluginOptions = opts => {
  pluginOptions = Object.assign({}, pluginOptions, opts)
  generalArgs.quality = pluginOptions.defaultQuality

  return pluginOptions
}

exports.getPluginOptions = () => pluginOptions
exports.getPluginOptionsDefaults = () => pluginDefaults

/**
 * Creates a transform object
 *
 * @param {Partial<import('./process-file').TransformArgs>} args
 */
exports.createTransformObject = args => {
  const options = {
    height: args.height,
    width: args.width,
    cropFocus: args.cropFocus,
    toFormat: args.toFormat,
    pngCompressionLevel:
      args.pngCompressionLevel || generalArgs.pngCompressionLevel,
    quality: args.quality,
    jpegQuality: args.jpegQuality,
    pngQuality: args.pngQuality,
    webpQuality: args.webpQuality,
    jpegProgressive: args.jpegProgressive || generalArgs.jpegProgressive,
    grayscale: args.grayscale || generalArgs.grayscale,
    rotate: args.rotate,
    trim: args.trim ? args.trim : undefined,
    duotone: args.duotone ? args.duotone : null,
    fit: args.fit,
    background: args.background,
    extractLeft: args.extractLeft,
    extractTop: args.extractTop,
    extractWidth: args.extractWidth,
    extractHeight: args.extractHeight,
  }

  // get all non falsey values
  return _.pickBy(options, _.identity)
}

/**
 * Used for gatsbyImageData and StaticImage only
 */
exports.mergeDefaults = args => doMergeDefaults(args, pluginOptions.defaults)

const customizer = (objValue, srcValue) =>
  Array.isArray(objValue) ? srcValue : undefined

function doMergeDefaults(args, defaults) {
  if (!defaults) {
    return args
  }
  return _.mergeWith({}, defaults, args, customizer)
}

exports.doMergeDefaults = doMergeDefaults

exports.healOptions = (
  { defaultQuality: quality, base64Width },
  args,
  fileExtension = ``,
  defaultArgs = {}
) => {
  let options = _.defaults({}, args, { quality }, defaultArgs, generalArgs)
  options.quality = parseInt(options.quality, 10)
  options.pngCompressionLevel = parseInt(options.pngCompressionLevel, 10)
  options.pngCompressionSpeed = parseInt(options.pngCompressionSpeed, 10)
  options.toFormat = options.toFormat.toLowerCase()
  options.toFormatBase64 = options.toFormatBase64.toLowerCase()
  options.base64Width = options.base64Width || base64Width

  // when toFormat is not set we set it based on fileExtension
  if (options.toFormat === ``) {
    if (!fileExtension) {
      throw new Error(
        `toFormat seems to be empty, we need a fileExtension to set it.`
      )
    }
    options.toFormat = fileExtension.toLowerCase()

    if (fileExtension === `jpeg`) {
      options.toFormat = `jpg`
    }
  }

  // only set width to 400 if neither width nor height is passed
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  } else if (options.width !== undefined) {
    options.width = parseInt(options.width, 10)
  } else if (options.height !== undefined) {
    options.height = parseInt(options.height, 10)
  }

  // only set maxWidth to 800 if neither maxWidth nor maxHeight is passed
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  } else if (options.maxWidth !== undefined) {
    options.maxWidth = parseInt(options.maxWidth, 10)
  } else if (options.maxHeight !== undefined) {
    options.maxHeight = parseInt(options.maxHeight, 10)
  }

  ;[`width`, `height`, `maxWidth`, `maxHeight`].forEach(prop => {
    if (typeof options[prop] !== `undefined` && options[prop] < 1) {
      throw new Error(
        `${prop} has to be a positive int larger than zero (> 0), now it's ${options[prop]}`
      )
    }
  })

  return options
}

/**
 * Removes all default values so we have the smallest transform args
 *
 * @param {Partial<import('./process-file').TransformArgs>} args
 * @param {{defaultQuality: number }} pluginOptions
 */
exports.removeDefaultValues = (args, pluginOptions) => {
  const options = {
    height: args.height,
    width: args.width,
    cropFocus: args.cropFocus,
    toFormat: args.toFormat,
    pngCompressionLevel:
      args.pngCompressionLevel !== generalArgs.pngCompressionLevel
        ? args.pngCompressionLevel
        : undefined,
    quality:
      args.quality !== pluginOptions.defaultQuality ? args.quality : undefined,
    jpegQuality: args.jpegQuality,
    pngQuality: args.pngQuality,
    webpQuality: args.webpQuality,
    jpegProgressive:
      args.jpegProgressive !== generalArgs.jpegProgressive
        ? args.jpegProgressive
        : undefined,
    grayscale:
      args.grayscale !== generalArgs.grayscale ? args.grayscale : undefined,
    rotate: args.rotate !== generalArgs.rotate ? args.rotate : undefined,
    trim: args.trim ? args.trim : undefined,
    duotone: args.duotone || undefined,
    fit: args.fit,
    background: args.background,
    extractLeft: args.extractLeft,
    extractTop: args.extractTop,
    extractWidth: args.extractWidth,
    extractHeight: args.extractHeight,
  }

  return _.omitBy(options, _.isNil)
}
