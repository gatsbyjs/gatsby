const crypto = require(`crypto`)
const { createWriteStream } = require(`fs`)
const { extname, join, resolve } = require(`path`)

const {
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const sqip = require(`sqip`)

module.exports = async (args) => {
  const { type: { name } } = args

  if (name === `ImageSharp`) {
    return sqipSharp(args)
  }

  if (name === `ContentfulAsset`) {
    return sqipContentful(args)
  }

  return {}
}

async function sqipSharp({ type, cache, getNodeAndSavePathDependency }) {
  if (type.name !== `ImageSharp`) {
    return {}
  }

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
        })
      },
    },
  }
}

async function sqipContentful({ type, store, cache }) {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const fs = require(`fs-extra`)
  const axios = require(`axios`)

  const { schemes: { ImageResizingBehavior, ImageCropFocusType } } = require(`gatsby-source-contentful`)

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
        const {
          id,
          file: { url, fileName, details, contentType },
          node_locale: locale,
        } = asset
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

        console.log(`Processing: ${id}-${locale}`)

        // Downloading small version of the image with same aspect ratio
        const assetWidth = width || details.image.width
        const assetHeight = height || details.image.height
        const aspectRatio = assetHeight / assetWidth
        const previewWidth = 256
        const previewHeight = Math.floor(previewWidth * aspectRatio)

        const params = [
          `w=${previewWidth}`,
          `h=${previewHeight}`,
        ]
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

        console.log(`Calculated path: ${absolutePath}`)

        if (!alreadyExists) {
          const previewUrl = `http:${url}?${params.join(`&`)}`

          console.log(`Downloading: ${previewUrl}`)

          const response = await axios({
            method: `get`,
            url: previewUrl,
            responseType: `stream`,
          })

          await new Promise((resolve, reject) => {
            const file = createWriteStream(absolutePath)
            response.data.pipe(file)
            file.on(`finish`, () => {
              resolve()
            })
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

  let svgThumbnail = await cache.get(cacheKey)

  if (!svgThumbnail) {
    console.log(`Calculating low quality svg thumbnail: ${absolutePath}`)
    const result = sqip(sqipOptions)
    // @todo make blur setting in sqip via PR
    svgThumbnail = result.final_svg.replace(new RegExp(`<feGaussianBlur stdDeviation="[0-9]+"\\s*/>`), `<feGaussianBlur stdDeviation="${sqipOptions.blur}" />`)

    await cache.set(cacheKey, svgThumbnail)
    console.log(`done calculating primitive ${absolutePath}`)
  }

  const dataURI = encodeOptimizedSVGDataUri(svgThumbnail)

  return dataURI
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
