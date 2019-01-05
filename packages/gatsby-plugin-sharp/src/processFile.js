const sharp = require(`sharp`)
const fs = require(`fs-extra`)
const debug = require(`debug`)(`gatsby:gatsby-plugin-sharp`)
const duotone = require(`./duotone`)
const imagemin = require(`imagemin`)
const imageminMozjpeg = require(`imagemin-mozjpeg`)
const imageminPngquant = require(`imagemin-pngquant`)
const imageminWebp = require(`imagemin-webp`)

const writeFileAsync = (file, buffer) =>
  new Promise((resovle, reject) => {
    fs.writeFile(file, buffer, err => {
      if (err) {
        return reject(err)
      }

      return resovle()
    })
  })

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). Sharp disables this feature by
// default as there's been problems with segfaulting in the past but we'll be
// adventurous and see what happens with it on.
sharp.simd(true)

module.exports = (file, transforms, options = {}) => {
  let pipeline
  try {
    pipeline = sharp(file)

    // Keep Metadata
    if (!options.stripMetadata) {
      pipeline = pipeline.withMetadata()
    }

    pipeline = pipeline.rotate()
  } catch (err) {
    throw new Error(`Failed to process image ${file}`)
  }

  return transforms.map(async ({ file: transformFile, outputPath, args }) => {
    debug(`Start processing ${outputPath}`)

    let clonedPipeline = transforms.length > 1 ? pipeline.clone() : pipeline

    // Sharp only allows ints as height/width. Since both aren't always
    // set, check first before trying to round them.
    let roundedHeight = args.height
    if (roundedHeight) {
      roundedHeight = Math.round(roundedHeight)
    }

    let roundedWidth = args.width
    if (roundedWidth) {
      roundedWidth = Math.round(roundedWidth)
    }

    clonedPipeline
      .resize(roundedWidth, roundedHeight, {
        position: args.cropFocus,
      })
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: args.toFormat === `png`,
      })
      .webp({
        quality: args.quality,
        force: args.toFormat === `webp`,
      })
      .tiff({
        quality: args.quality,
        force: args.toFormat === `tiff`,
      })

    // jpeg
    if (!options.useMozJpeg) {
      clonedPipeline = clonedPipeline.jpeg({
        quality: args.quality,
        progressive: args.jpegProgressive,
        force: args.toFormat === `jpg`,
      })
    }

    // grayscale
    if (args.grayscale) {
      clonedPipeline = clonedPipeline.grayscale()
    }

    // rotate
    if (args.rotate && args.rotate !== 0) {
      clonedPipeline = clonedPipeline.rotate(args.rotate)
    }

    // duotone
    if (args.duotone) {
      clonedPipeline = await duotone(
        args.duotone,
        args.toFormat || transformFile.extension,
        clonedPipeline
      )
    }

    // lets decide how we want to save this transform
    if (
      (transformFile.extension === `png` && args.toFormat === ``) ||
      args.toFormat === `png`
    ) {
      return compressPng(clonedPipeline, outputPath, {
        ...args,
        stripMetadata: options.stripMetadata,
      })
    }

    if (
      options.useMozJpeg &&
      ((transformFile.extension === `jpg` && args.toFormat === ``) ||
        (transformFile.extension === `jpeg` && args.toFormat === ``) ||
        args.toFormat === `jpg`)
    ) {
      return compressJpg(clonedPipeline, outputPath, args)
    }

    if (
      (file.extension === `webp` && args.toFormat === ``) ||
      args.toFormat === `webp`
    ) {
      return compressWebP(clonedPipeline, outputPath, args)
    }

    return clonedPipeline.toFile(outputPath)
  })
}

const compressPng = (pipeline, outputPath, options) =>
  pipeline.toBuffer().then(sharpBuffer =>
    imagemin
      .buffer(sharpBuffer, {
        plugins: [
          imageminPngquant({
            quality: `${options.quality}-${Math.min(
              options.quality + 25,
              100
            )}`, // e.g. 40-65
            speed: options.pngCompressionSpeed
              ? options.pngCompressionSpeed
              : undefined,
            strip: !!options.stripMetadata, // Must be a bool
          }),
        ],
      })
      .then(imageminBuffer => writeFileAsync(outputPath, imageminBuffer))
  )

const compressJpg = (pipeline, outputPath, options) =>
  pipeline.toBuffer().then(sharpBuffer =>
    imagemin
      .buffer(sharpBuffer, {
        plugins: [
          imageminMozjpeg({
            quality: options.quality,
            progressive: options.jpegProgressive,
          }),
        ],
      })
      .then(imageminBuffer => writeFileAsync(outputPath, imageminBuffer))
  )

const compressWebP = (pipeline, outputPath, options) =>
  pipeline.toBuffer().then(sharpBuffer =>
    imagemin
      .buffer(sharpBuffer, {
        plugins: [imageminWebp({ quality: options.quality })],
      })
      .then(imageminBuffer => writeFileAsync(outputPath, imageminBuffer))
  )
