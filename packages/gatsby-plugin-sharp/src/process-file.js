const sharp = require(`./safe-sharp`)
const fs = require(`fs-extra`)
const path = require(`path`)
const debug = require(`debug`)(`gatsby:gatsby-plugin-sharp-ggat`)
const duotone = require(`./duotone`)
const imagemin = require(`imagemin`)
const imageminMozjpeg = require(`imagemin-mozjpeg`)
const imageminPngquant = require(`imagemin-pngquant`)
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

/**+
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

      if (
        transformArgs.extractLeft !== undefined &&
        transformArgs.extractLeft !== undefined &&
        transformArgs.extractWidth !== undefined &&
        transformArgs.extractHeight !== undefined
      ) {
        clonedPipeline = sharp(
          await clonedPipeline
            .extract({
              left: transformArgs.extractLeft,
              top: transformArgs.extractTop,
              width: transformArgs.extractWidth,
              height: transformArgs.extractHeight,
            })
            .toBuffer()
        )
      }

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

      // jpeg
      if (!options.useMozJpeg) {
        clonedPipeline = clonedPipeline.jpeg({
          quality: transformArgs.jpegQuality || transformArgs.quality,
          progressive: transformArgs.jpegProgressive,
          force: transformArgs.toFormat === `jpg`,
        })
      }

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

      // lets decide how we want to save this transform
      if (transformArgs.toFormat === `png`) {
        await compressPng(clonedPipeline, outputPath, {
          pngQuality: transformArgs.pngQuality,
          quality: transformArgs.quality,
          pngCompressionSpeed: transformArgs.compressionSpeed,
          stripMetadata: options.stripMetadata,
        })
        return transform
      }

      if (options.useMozJpeg && transformArgs.toFormat === `jpg`) {
        await compressJpg(clonedPipeline, outputPath, transformArgs)
        return transform
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

const compressPng = (pipeline, outputPath, options) =>
  pipeline.toBuffer().then(sharpBuffer =>
    imagemin
      .buffer(sharpBuffer, {
        plugins: [
          imageminPngquant({
            quality: [
              (options.pngQuality || options.quality) / 100,
              Math.min(((options.pngQuality || options.quality) + 25) / 100, 1),
            ], // e.g. [0.4, 0.65]
            speed: options.pngCompressionSpeed
              ? options.pngCompressionSpeed
              : undefined,
            strip: !!options.stripMetadata, // Must be a bool
          }),
        ],
      })
      .then(imageminBuffer => fs.writeFile(outputPath, imageminBuffer))
  )

const compressJpg = (pipeline, outputPath, options) =>
  pipeline.toBuffer().then(sharpBuffer =>
    imagemin
      .buffer(sharpBuffer, {
        plugins: [
          imageminMozjpeg({
            quality: options.jpegQuality || options.quality,
            progressive: options.jpegProgressive,
          }),
        ],
      })
      .then(imageminBuffer => fs.writeFile(outputPath, imageminBuffer))
  )

exports.createArgsDigest = args => {
  const argsDigest = createContentDigest(args)

  return argsDigest.substr(argsDigest.length - 5)
}
