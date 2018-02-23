const crypto = require(`crypto`)
const { createWriteStream } = require(`fs`)
const { extname, join, resolve } = require(`path`)

const axios = require(`axios`)
const {
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const fs = require(`fs-extra`)
const sqip = require(`sqip`)

module.exports = async ({ type, store, cache }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

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
        // @todo allow width & height, respect aspect ratio
      },
      async resolve(asset, fieldArgs, context) {
        const { id, file: { url, fileName }, node_locale: locale, internal: { contentDigest } } = asset
        const { blur, numberOfPrimitives, mode } = fieldArgs

        console.log(`Processing: ${id}-${locale}`)

        const extension = extname(fileName)
        const absolutePath = resolve(cacheDir, `${contentDigest}${extension}`)

        const alreadyExists = await fs.pathExists(absolutePath)

        if (!alreadyExists) {
          console.log(`Downloading: ${url}`)
          const response = await axios({
            method: `get`,
            url: `http:${url}?w=256`,
            responseType: `stream`,
          })

          await new Promise((resolve, reject) => {

            const file = createWriteStream(absolutePath)
            response.data.pipe(file)
            file.on(`finish`, () => { resolve() })
            file.on(`error`, reject)
          })
        }

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

        const cacheKey = `sqip-${contentDigest}-${optionsHash}`

        let svgThumbnail = await cache.get(cacheKey)

        if (!svgThumbnail) {
          console.log(`Calculating low quality svg thumbnail: ${url}`)
          const result = sqip(sqipOptions)
          // @todo make blur setting in sqip via PR
          svgThumbnail = result.final_svg.replace(new RegExp(`<feGaussianBlur stdDeviation="[0-9]+"\\s*/>`), `<feGaussianBlur stdDeviation="${sqipOptions.blur}" />`)

          await cache.set(cacheKey, svgThumbnail)
          console.log(`done calculating primitive ${url}`)
        }

        const dataURI = encodeOptimizedSVGDataUri(svgThumbnail)

        return dataURI
      },
    },
  }
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
