import path from "path"
import Debug from "debug"
import { promises as fs, constants } from "fs"
import sharp from "sharp"

import type { GatsbyNode, Node } from "gatsby"
import { GraphQLFieldResolver, GraphQLJSON } from "gatsby/graphql"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "gatsby/graphql"
import { queueImageResizing } from "gatsby-plugin-sharp"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import {
  DuotoneGradientType,
  ImageCropFocusType,
} from "gatsby-transformer-sharp/types"

import { generateSqip } from "./generate-sqip"
import { SqipMetadata } from "./create-schema-customization"

const debug = Debug(`gatsby-transformer-sqip`)
const SUPPORTED_NODES = [`ImageSharp`, `ContentfulAsset`]

const sqipSharp: GatsbyNode["setFieldsOnGraphQLNodeType"] = async ({
  cache,
  getNodeAndSavePathDependency,
}) => {
  const cacheDir = path.resolve(`${cache.directory}/intermediate-files/`)

  try {
    await fs.mkdir(cacheDir, {
      recursive: true,
    })
  } catch {
    // noop
  }

  const resolve: GraphQLFieldResolver<
    Node,
    {
      path: string
    },
    {
      blur?: number
      cropFocus?: ImageCropFocusType
      duotone: DuotoneGradientType
      grayscale?: boolean
      height: number
      mode?: number
      numberOfPrimitives?: number
      rotate?: number
      width?: number
    }
  > = async (image, fieldArgs, context) => {
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

    if (!image.parent) {
      return null
    }

    const file = getNodeAndSavePathDependency(image.parent, context.path)
    const { contentDigest } = image.internal

    const job = await queueImageResizing({ file, args: sharpArgs })

    try {
      await fs.access(job.absolutePath, constants.R_OK)
    } catch {
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
  }

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
      resolve,
    },
  }
}

const sqipContentful: GatsbyNode["setFieldsOnGraphQLNodeType"] = async ({
  cache,
  createContentDigest,
}) => {
  const {
    schemes: { ImageResizingBehavior, ImageCropFocusType },
  } = require(`gatsby-source-contentful`)

  const cacheDir = path.resolve(`${cache.directory}/intermediate-files/`)

  try {
    await fs.mkdir(cacheDir, {
      recursive: true,
    })
  } catch {
    // noop
  }

  const resolve: GraphQLFieldResolver<
    {
      file: {
        contentType: string
        url: string
        fileName: string
      }
    },
    unknown,
    {
      background?: string
      blur?: number
      cropFocus?:
        | "top"
        | "top_left"
        | "top_right"
        | "bottom"
        | "bottom_left"
        | "bottom_right"
        | "right"
        | "left"
        | "face"
        | "faces"
        | "center"
      height: number
      mode?: number
      numberOfPrimitives?: number
      resizingBehavior: `` | `pad` | `crop` | `fill` | `thumb` | `scale`
      width?: number
    }
  > = async (asset, fieldArgs) => {
    const {
      createUrl,
      mimeTypeExtensions,
    } = require(`gatsby-source-contentful/image-helpers`)

    const {
      file: { contentType, url: imgUrl, fileName },
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

    const extension = mimeTypeExtensions.get(contentType)
    const url = createUrl(imgUrl, options)
    const name = path.basename(fileName, extension)

    const absolutePath = await fetchRemoteFile({
      url,
      name,
      cache,
      ext: extension,
    })

    const contentDigest = await createContentDigest(absolutePath)

    return generateSqip({
      cache,
      cacheDir,
      contentDigest,
      absolutePath,
      numberOfPrimitives,
      blur,
      mode,
    })
  }

  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `SqipContentful`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
          metadata: { type: SqipMetadata },
          additional_metadata: { type: GraphQLJSON },
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
      resolve,
    },
  }
}

export const setFieldsOnGraphQLNodeType: GatsbyNode["setFieldsOnGraphQLNodeType"] =
  async (args, options, cb) => {
    const {
      type: { name },
    } = args

    if (!SUPPORTED_NODES.includes(name)) {
      return {}
    }
    if (name === `ImageSharp`) {
      return sqipSharp(args, options, cb)
    }

    if (name === `ContentfulAsset`) {
      return sqipContentful(args, options, cb)
    }

    return {}
  }
