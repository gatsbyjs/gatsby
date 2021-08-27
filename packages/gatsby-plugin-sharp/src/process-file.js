const sharp = require(`./safe-sharp`)
const fs = require(`fs-extra`)
const path = require(`path`)
const debug = require(`debug`)(`gatsby:gatsby-plugin-sharp`)
const duotone = require(`./duotone`)
const { healOptions } = require(`./plugin-options`)
const { SharpError } = require(`./sharp-error`)
const { createContentDigest } = require(`gatsby-core-utils`)

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). Sharp disables this feature by
// default as there's been problems with segfaulting in the past but we'll be
// adventurous and see what happens with it on.
sharp.simd(true)

// Concurrency is handled in gatsby-worker queue instead
sharp.concurrency(1)

/**
 * @typedef DuotoneArgs
 * @property {string} highlight
 * @property {string} shadow
 * @property {number} opacity
 */

/**
 * @typedef {Object} TransformArgs
 * @property {number} height
 * @property {number} width
 * @property {number} cropFocus
 * @property {string} toFormat
 * @property {number} pngCompressionLevel
 * @property {number} quality
 * @property {number} jpegQuality
 * @property {number} pngQuality
 * @property {number} webpQuality
 * @property {boolean} jpegProgressive
 * @property {boolean} grayscale
 * @property {number} rotate
 * @property {number} trim
 * @property {DuotoneArgs} duotone
 * @property {string} background
 * @property {import('sharp').FitEnum} fit
 */

/** +
 * @typedef {Object} Transform
 * @property {string} outputPath
 * @property {TransformArgs} args
 */

/**
 * @param {String} file
 * @param {Transform[]} transforms
 */
exports.processFile = (file, transforms, options = {}) => {
  let pipeline
  try {
    pipeline = !options.failOnError
      ? sharp(file, { failOnError: false })
      : sharp(file)

    // Keep Metadata
    if (!options.stripMetadata) {
      pipeline = pipeline.withMetadata()
    }
  } catch (err) {
    throw new SharpError(`Failed to load image ${file} into sharp.`, err)
  }

  return transforms.map(async transform => {
    try {
      const { outputPath, args } = transform
      debug(`Start processing ${outputPath}`)
      await fs.ensureDir(path.dirname(outputPath))

      const transformArgs = healOptions(
        { defaultQuality: options.defaultQuality },
        args
      )

      let clonedPipeline = transforms.length > 1 ? pipeline.clone() : pipeline

      if (transformArgs.trim) {
        clonedPipeline = clonedPipeline.trim(transformArgs.trim)
      }

      if (!transformArgs.rotate) {
        clonedPipeline = clonedPipeline.rotate()
      }

      // Sharp only allows ints as height/width. Since both aren't always
      // set, check first before trying to round them.
      let roundedHeight = transformArgs.height
      if (roundedHeight) {
        roundedHeight = Math.round(roundedHeight)
      }

      let roundedWidth = transformArgs.width
      if (roundedWidth) {
        roundedWidth = Math.round(roundedWidth)
      }

      clonedPipeline
        .resize(roundedWidth, roundedHeight, {
          position: transformArgs.cropFocus,
          fit: transformArgs.fit,
          background: transformArgs.background,
        })
        .png({
          compressionLevel: transformArgs.pngCompressionLevel,
          adaptiveFiltering: false,
          quality: transformArgs.pngQuality || transformArgs.quality,
          force: transformArgs.toFormat === `png`,
        })
        .webp({
          quality: transformArgs.webpQuality || transformArgs.quality,
          force: transformArgs.toFormat === `webp`,
        })
        .tiff({
          quality: transformArgs.quality,
          force: transformArgs.toFormat === `tiff`,
        })
        .avif({
          quality: transformArgs.quality,
          force: transformArgs.toFormat === `avif`,
        })
        .jpeg({
          mozjpeg: options.useMozJpeg,
          quality: transformArgs.jpegQuality || transformArgs.quality,
          progressive: transformArgs.jpegProgressive,
          force: transformArgs.toFormat === `jpg`,
        })

      // grayscale
      if (transformArgs.grayscale) {
        clonedPipeline = clonedPipeline.grayscale()
      }

      // rotate
      if (transformArgs.rotate && transformArgs.rotate !== 0) {
        clonedPipeline = clonedPipeline.rotate(transformArgs.rotate)
      }

      // duotone
      if (transformArgs.duotone) {
        clonedPipeline = await duotone(
          transformArgs.duotone,
          transformArgs.toFormat,
          clonedPipeline
        )
      }

      try {
        await clonedPipeline.toFile(outputPath)
      } catch (err) {
        throw new Error(
          `Failed to write ${file} into ${outputPath}. (${err.message})`
        )
      }
    } catch (err) {
      if (err instanceof SharpError) {
        // rethrow
        throw err
      }

      throw new SharpError(`Processing ${file} failed`, err)
    }

    return transform
  })
}

exports.createArgsDigest = args => {
  const argsDigest = createContentDigest(args)

  return argsDigest.substr(argsDigest.length - 5)
}
