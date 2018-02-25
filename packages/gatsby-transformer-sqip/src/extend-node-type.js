const crypto = require(`crypto`)
const { extname, join, resolve } = require(`path`)

const fs = require(`fs-extra`)
const { GraphQLObjectType, GraphQLString, GraphQLInt } = require(`graphql`)
const PQueue = require(`p-queue`)
const ProgressBar = require(`progress`)
const sqip = require(`sqip`)

const SUPPORTED_NODES = [`ImageSharp`, `ContentfulAsset`]
const queue = new PQueue({ concurrency: 1 })
let bar

module.exports = async args => {
  const { type: { name } } = args

  if (!SUPPORTED_NODES.includes(name)) {
    return {}
  }

  // @todo progress bar does not show up some times
  bar = new ProgressBar(
    `Generating sqip's [:bar] :current/:total :percent :eta left`,
    {
      total: 0,
      width: process.stdout.columns || 40,
    }
  )

  if (name === `ImageSharp`) {
    return sqipSharp(args)
  }

  if (name === `ContentfulAsset`) {
    return sqipContentful(args)
  }

  return {}
}

async function sqipSharp({ type, cache, getNodeAndSavePathDependency, store }) {
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
      },
      async resolve(image, fieldArgs, context) {
        const { blur, numberOfPrimitives, mode } = fieldArgs

        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const { absolutePath } = file

        return generateSqip({
          cache,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
          store,
        })
      },
    },
  }
}

async function sqipContentful({ type, store, cache }) {
  const { createWriteStream } = require(`fs`)
  const axios = require(`axios`)

  const {
    schemes: { ImageResizingBehavior, ImageCropFocusType },
  } = require(`gatsby-source-contentful`)

  const cacheDir = join(
    store.getState().program.directory,
    `.cache`,
    `gatsby-transform-sqip`
  )

  // Ensure our cache directory exists.
  await fs.ensureDir(cacheDir)

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
        const previewWidth = 256
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

          bar.interrupt(`Downloading: ${previewUrl}`)

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
          store,
        })
      },
    },
  }
}

async function generateSqip(options) {
  const { cache, absolutePath, numberOfPrimitives, blur, mode, store } = options

  const dataDir = join(store.getState().program.directory, `.cache-sqip`)

  // @todo add check if file actually exists

  const sqipOptions = {
    filename: absolutePath,
    numberOfPrimitives,
    blur,
    mode,
  }

  const optionsHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(sqipOptions))
    .digest(`hex`)

  const cacheKey = `sqip-${optionsHash}`
  const cachePath = resolve(dataDir, `sqip-${optionsHash}.json`)
  let primitiveData = await cache.get(cacheKey)

  await fs.ensureDir(dataDir)

  bar.total++

  if (!primitiveData) {
    if (await fs.exists(cachePath)) {
      const cacheData = await fs.readFile(cachePath)
      primitiveData = JSON.parse(cacheData)
    } else {
      const result = await queue.add(
        async () =>
          new Promise((resolve, reject) => {
            try {
              resolve(sqip(sqipOptions))
            } catch (error) {
              reject(error)
            }
          })
      )

      // @todo make blur setting in sqip via PR
      result.final_svg = result.final_svg.replace(
        new RegExp(`<feGaussianBlur stdDeviation="[0-9]+"\\s*/>`),
        `<feGaussianBlur stdDeviation="${sqipOptions.blur}" />`
      )

      primitiveData = {
        svg: result.final_svg,
        dataURI: encodeOptimizedSVGDataUri(result.final_svg),
        dataURIbase64: `data:image/svg+xml;base64,${result.svg_base64encoded}`,
      }

      const json = JSON.stringify(primitiveData, null, 2)
      await fs.writeFile(cachePath, json)
    }

    bar.tick()
    await cache.set(cacheKey, primitiveData)
  }

  return primitiveData
}

// https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeOptimizedSVGDataUri(svgString) {
  var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
    .replace(/%0A/g, ``) // remove newlines
    .replace(/%20/g, ` `) // put spaces back in
    .replace(/%3D/g, `=`) // ditto equals signs
    .replace(/%3A/g, `:`) // ditto colons
    .replace(/%2F/g, `/`) // ditto slashes
    .replace(/%22/g, `'`) // replace quotes with apostrophes (may break certain SVGs)

  return `data:image/svg+xml,` + uriPayload
}
