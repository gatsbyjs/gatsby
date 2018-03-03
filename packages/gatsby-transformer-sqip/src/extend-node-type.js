const crypto = require(`crypto`)
const { extname, join, resolve, parse } = require(`path`)

const {
  DuotoneGradientType,
  ImageCropFocusType,
} = require(`gatsby-transformer-sharp/types`)
const { queueImageResizing } = require(`gatsby-plugin-sharp`)

const Debug = require(`debug`)
const fs = require(`fs-extra`)
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} = require(`graphql`)
const svgToMiniDataURI = require(`mini-svg-data-uri`)
const PQueue = require(`p-queue`)
const sharp = require(`sharp`)
const sqip = require(`sqip`)

const SUPPORTED_NODES = [`ImageSharp`, `ContentfulAsset`]
const cacheDir = join(process.cwd(), `public`, `static`)
const queue = new PQueue({ concurrency: 1 })
const debug = Debug(`gatsby-transformer-qip`)

module.exports = async args => {
  const { type: { name } } = args

  if (!SUPPORTED_NODES.includes(name)) {
    return {}
  }

  // Ensure our cache directory exists.
  await fs.ensureDir(cacheDir)

  if (name === `ImageSharp`) {
    return sqipSharp(args)
  }

  if (name === `ContentfulAsset`) {
    return sqipContentful(args)
  }

  return {}
}

async function sqipSharp({ type, cache, getNodeAndSavePathDependency }) {
  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `Sqip`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
          dataURIbase64: { type: GraphQLString },
        },
      }),
      args: {
        blur: { type: GraphQLInt, defaultValue: 1 },
        numberOfPrimitives: { type: GraphQLInt, defaultValue: 10 },
        mode: { type: GraphQLInt, defaultValue: 0 },
        width: {
          type: GraphQLInt,
          defaultValue: 400,
        },
        height: {
          type: GraphQLInt,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      async resolve(image, fieldArgs, context) {
        const {
          blur,
          numberOfPrimitives,
          mode,
          width,
          height,
          grayscale,
          duotone,
          cropFocus,
          rotate,
        } = fieldArgs

        const sharpArgs = {
          width,
          height,
          grayscale,
          duotone,
          cropFocus,
          rotate,
        }

        const file = getNodeAndSavePathDependency(image.parent, context.path)

        const job = await queueImageResizing({ file, args: sharpArgs })

        if (!await fs.exists(job.absolutePath)) {
          debug(`Preparing ${file.name}`)
          await job.finishedPromise
        }

        const { absolutePath } = job

        return generateSqip({
          cache,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}

async function sqipContentful({ type, cache }) {
  const { createWriteStream } = require(`fs`)
  const axios = require(`axios`)

  const {
    schemes: { ImageResizingBehavior, ImageCropFocusType },
  } = require(`gatsby-source-contentful`)

  return {
    sqip: {
      type: GraphQLString,
      args: {
        blur: {
          type: GraphQLInt,
          defaultValue: 1,
        },
        numberOfPrimitives: {
          type: GraphQLInt,
          defaultValue: 10,
        },
        mode: {
          type: GraphQLInt,
          defaultValue: 0,
        },
        width: {
          type: GraphQLInt,
          defaultValue: 256,
        },
        height: {
          type: GraphQLInt,
        },
        resizingBehavior: {
          type: ImageResizingBehavior,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
        background: {
          type: GraphQLString,
          defaultValue: null,
        },
      },
      async resolve(asset, fieldArgs, context) {
        const { id, file: { url, fileName, details, contentType } } = asset
        const {
          blur,
          numberOfPrimitives,
          mode,
          width,
          height,
          resizingBehavior,
          cropFocus,
          background,
        } = fieldArgs

        if (contentType.indexOf(`image/`) !== 0) {
          return null
        }

        // Downloading small version of the image with same aspect ratio
        const assetWidth = width || details.image.width
        const assetHeight = height || details.image.height
        const aspectRatio = assetHeight / assetWidth
        const previewWidth = 400
        const previewHeight = Math.floor(previewWidth * aspectRatio)

        const params = [`w=${previewWidth}`, `h=${previewHeight}`]
        if (resizingBehavior) {
          params.push(`fit=${resizingBehavior}`)
        }
        if (cropFocus) {
          params.push(`crop=${cropFocus}`)
        }
        if (background) {
          params.push(`bg=${background}`)
        }

        const uniqueId = [
          id,
          aspectRatio,
          resizingBehavior,
          cropFocus,
          background,
        ]
          .filter(Boolean)
          .join(`-`)

        const extension = extname(fileName)
        const absolutePath = resolve(cacheDir, `${uniqueId}${extension}`)

        const alreadyExists = await fs.pathExists(absolutePath)

        if (!alreadyExists) {
          const previewUrl = `http:${url}?${params.join(`&`)}`

          debug(`Downloading: ${previewUrl}`)

          const response = await axios({
            method: `get`,
            url: previewUrl,
            responseType: `stream`,
          })

          await new Promise((resolve, reject) => {
            const file = createWriteStream(absolutePath)
            response.data.pipe(file)
            file.on(`finish`, resolve)
            file.on(`error`, reject)
          })
        }

        return generateSqip({
          cache,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}

async function generateSqip(options) {
  const { cache, absolutePath, numberOfPrimitives, blur, mode } = options

  const { name } = parse(absolutePath)

  const sqipOptions = {
    numberOfPrimitives,
    blur,
    mode,
  }

  const optionsHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(sqipOptions))
    .digest(`hex`)

  const cacheKey = `sqip-${name}-${optionsHash}`
  const cachePath = resolve(cacheDir, `${name}-${optionsHash}.svg`)
  let primitiveData = await cache.get(cacheKey)

  if (!primitiveData) {
    let svg
    if (await fs.exists(cachePath)) {
      const svgBuffer = await fs.readFile(cachePath)
      svg = svgBuffer.toString()
    } else {
      debug(`generate sqip for ${name}`)
      const result = await queue.add(
        async () =>
          new Promise((resolve, reject) => {
            try {
              const result = sqip({
                filename: absolutePath,
                ...sqipOptions,
              })
              resolve(result)
            } catch (error) {
              reject(error)
            }
          })
      )

      svg = result.final_svg

      await fs.writeFile(cachePath, svg)
    }

    primitiveData = {
      svg,
      dataURI: svgToMiniDataURI(svg),
    }

    await cache.set(cacheKey, primitiveData)
  }

  return primitiveData
}
