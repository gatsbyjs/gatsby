import sharp from "./safe-sharp"
import fs from "fs-extra"
import path from "path"
import debug from "debug"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import duotone from "./duotone"
import {
  healOptions,
  ITransformArgs,
  ISharpPluginOptions,
} from "./plugin-options"
import { SharpError } from "./sharp-error"

const log = debug(`gatsby:gatsby-plugin-sharp`)

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). Sharp disables this feature by
// default as there's been problems with segfaulting in the past but we'll be
// adventurous and see what happens with it on.
sharp.simd(true)

// Concurrency is handled in gatsby-worker queue instead
sharp.concurrency(1)

interface ITransform {
  outputPath: string
  args: ITransformArgs
}

export const processFile = async (
  file: string,
  transforms: Array<ITransform>,
  options = {} as ISharpPluginOptions
): Promise<Array<ITransform>> => {
  let pipeline
  try {
    const inputBuffer = await fs.readFile(file)
    pipeline = sharp(inputBuffer, { failOn: options.failOn })

    // Keep Metadata
    if (!options.stripMetadata) {
      pipeline = pipeline.withMetadata()
    }
  } catch (err) {
    throw new SharpError(`Failed to load image ${file} into sharp.`, err)
  }

  return Promise.all(
    transforms.map(async transform => {
      try {
        const { outputPath, args } = transform
        log(`Start processing ${outputPath}`)
        await fs.ensureDir(path.dirname(outputPath))

        const transformArgs = healOptions(
          { defaultQuality: options.defaultQuality as number },
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
          const buffer = await clonedPipeline.toBuffer()
          await fs.writeFile(outputPath, buffer)
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
  )
}

export const createArgsDigest = (args: unknown): string => {
  const argsDigest = createContentDigest(args)

  return argsDigest.slice(-5)
}
