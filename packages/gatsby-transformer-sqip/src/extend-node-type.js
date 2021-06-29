const path = require(`path`)

const Debug = require(`debug`)
const fs = require(`fs-extra`)
const sharp = require(`sharp`)
const md5File = require(`md5-file`)

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} = require(`gatsby/graphql`)
const { queueImageResizing } = require(`gatsby-plugin-sharp`)
const { fetchRemoteFile } = require(`gatsby-core-utils`)
const {
  DuotoneGradientType,
  ImageCropFocusType,
} = require(`gatsby-transformer-sharp/types`)

const generateSqip = require(`./generate-sqip`)

const debug = Debug(`gatsby-transformer-sqip`)
const SUPPORTED_NODES = [`ImageSharp`, `ContentfulAsset`]

module.exports = async args => {
  const {
    type: { name },
  } = args

  if (!SUPPORTED_NODES.includes(name)) {
    return {}
  }
  if (name === `ImageSharp`) {
    return sqipSharp(args)
  }

  if (name === `ContentfulAsset`) {
    return sqipContentful(args)
  }

  return {}
}

async function sqipSharp({ type, cache, getNodeAndSavePathDependency, store }) {
  const program = store.getState().program
  const cacheDir = path.resolve(
    `${program.directory}/node_modules/.cache/gatsby-transformer-sqip/`
  )

  await fs.ensureDir(cacheDir)

  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `SqipSharp`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
        },
      }),
      args: {
        blur: { type: GraphQLInt, defaultValue: 1 },
        numberOfPrimitives: { type: GraphQLInt, defaultValue: 10 },
        mode: { type: GraphQLInt, defaultValue: 0 },
        width: {
          type: GraphQLInt,
          defaultValue: 256,
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
        const { contentDigest } = image.internal

        const job = await queueImageResizing({ file, args: sharpArgs })

        if (!(await fs.exists(job.absolutePath))) {
          debug(`Preparing ${file.name}`)
          await job.finishedPromise
        }

        const { absolutePath } = job

        return generateSqip({
          cache,
          cacheDir,
          contentDigest,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}

async function sqipContentful({ type, cache, store }) {
  const {
    schemes: { ImageResizingBehavior, ImageCropFocusType },
  } = require(`gatsby-source-contentful`)

  const program = store.getState().program
  const cacheDir = path.resolve(
    `${program.directory}/node_modules/.cache/gatsby-transformer-sqip/`
  )

  await fs.ensureDir(cacheDir)

  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `SqipContentful`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
        },
      }),
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
          createUrl,
        } = require(`gatsby-source-contentful/extend-node-type`)

        const {
          file: { contentType, url: imgUrl },
        } = asset

        if (!contentType.includes(`image/`)) {
          return null
        }

        const {
          blur,
          numberOfPrimitives,
          mode,
          resizingBehavior,
          cropFocus,
          background,
        } = fieldArgs

        let { width, height } = fieldArgs

        if (width && height) {
          const aspectRatio = height / width
          height = height * aspectRatio
        }

        const options = {
          width: 256,
          height,
          resizingBehavior,
          cropFocus,
          background,
        }

        const url = createUrl(imgUrl, options)
        const extension = path.extname(imgUrl)
        const absolutePath = await fetchRemoteFile({
          url,
          cache,
          ext: extension,
        })

        const contentDigest = await md5File(absolutePath)

        return generateSqip({
          cache,
          cacheDir,
          contentDigest,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}
