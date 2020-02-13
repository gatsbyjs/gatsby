import { join, parse } from "path"

import { GraphQLString, GraphQLInt, GraphQLFloat } from "gatsby/graphql"
import { ensureDir } from "fs-extra"

import FFMPEG from "./ffmpeg"

class WrongFileTypeError extends Error {}

const DEFAULT_ARGS = {
  maxWidth: { type: GraphQLInt, defaultValue: 1920 },
  maxHeight: { type: GraphQLInt, defaultValue: null },
  duration: { type: GraphQLInt, defaultValue: null },
  fps: { type: GraphQLInt, defaultValue: null },
  saturation: { type: GraphQLFloat, defaultValue: 1 },
  overlay: { type: GraphQLString, defaultValue: null },
  overlayX: { type: GraphQLString, defaultValue: `center` },
  overlayY: { type: GraphQLString, defaultValue: `center` },
  overlayPadding: { type: GraphQLInt, defaultValue: 10 },
  publicPath: {
    type: GraphQLString,
    defaultValue: `assets/videos`,
  },
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions

  const typeDefs = [
    schema.buildObjectType({
      name: `GatsbyVideo`,
      fields: {
        path: GraphQLString,
        absolutePath: GraphQLString,
        name: GraphQLString,
        ext: GraphQLString,
        codec: GraphQLString,
        formatName: GraphQLString,
        formatLongName: GraphQLString,
        startTime: GraphQLFloat,
        duration: GraphQLFloat,
        size: GraphQLInt,
        bitRate: GraphQLInt,
      },
    }),
  ]

  createTypes(typeDefs)
}

exports.createResolvers = (
  { createResolvers, store, cache, createNodeId, actions },
  { ffmpegPath, ffprobePath }
) => {
  const { createNode } = actions

  const program = store.getState().program
  const rootDir = program.directory

  const ffmpeg = new FFMPEG({ rootDir, ffmpegPath, ffprobePath })

  // Get source videos metadata and download the file if required
  async function prepareAndAnalyzeVideo({ video, fieldArgs }) {
    const { type } = video.internal

    let fileType = null
    if (type === `File`) {
      fileType = video.internal.mediaType
    }

    if (type === `ContentfulAsset`) {
      fileType = video.file.contentType
    }

    if (!fileType) {
      throw new Error(
        `Unable to extract asset file type for ${type} (${video.id})`
      )
    }

    if (fileType.indexOf(`video/`) === -1) {
      throw new WrongFileTypeError()
    }

    const metadata = await ffmpeg.analyzeVideo({
      store,
      cache,
      createNode,
      createNodeId,
      type,
      video,
      fieldArgs,
    })

    if (!metadata) {
      throw new Error(
        `Unable to read metadata from:\n\n${JSON.stringify(video, null, 2)}`
      )
    }

    const { path, filename, info } = metadata
    const publicDir = join(rootDir, `public`, fieldArgs.publicPath)

    await ensureDir(publicDir)

    return {
      publicDir,
      path,
      filename,
      info,
    }
  }

  // Analyze the resulting video and prepare field return values
  async function processResult(absolutePath) {
    const result = await ffmpeg.executeFfprobe(absolutePath)

    const {
      format_name: formatName,
      format_long_name: formatLongName,
      start_time: startTime,
      duration: duration,
      size: size,
      bit_rate: bitRate,
    } = result.format

    const path = absolutePath.replace(join(rootDir, `public`), ``)

    const { name, ext } = parse(absolutePath)

    return {
      path,
      absolutePath,
      name,
      ext,
      formatName,
      formatLongName,
      startTime: startTime === `N/A` ? null : startTime,
      duration: duration === `N/A` ? null : duration,
      size: size === `N/A` ? null : size,
      bitRate: bitRate === `N/A` ? null : bitRate,
    }
  }

  // Transform video with a given transformer & codec
  function transformVideo({ transformer, codec }) {
    return async (video, fieldArgs) => {
      try {
        const {
          publicDir,
          path,
          filename,
          info,
        } = await prepareAndAnalyzeVideo({
          video,
          fieldArgs,
        })

        const absolutePath = await transformer({
          publicDir,
          path,
          filename,
          fieldArgs,
          info,
        })

        const fieldResult = await processResult(absolutePath)

        return {
          ...fieldResult,
          codec,
        }
      } catch (err) {
        if (!(err instanceof WrongFileTypeError)) {
          throw err
        }

        return null
      }
    }
  }

  const videoFields = {
    videoH264: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
        crf: { type: GraphQLInt, defaultValue: 34 },
        preset: { type: GraphQLString, defaultValue: `veryslow` },
        maxRate: { type: GraphQLString, defaultValue: `2M` },
        bufSize: { type: GraphQLString, defaultValue: `4M` },
      },
      resolve: transformVideo({
        transformer: ffmpeg.createH264,
        codec: `h264`,
      }),
    },
    videoH265: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
        crf: { type: GraphQLInt, defaultValue: null },
        preset: { type: GraphQLString, defaultValue: `veryslow` },
        maxRate: { type: GraphQLInt, defaultValue: 1000 },
        bufSize: { type: GraphQLInt, defaultValue: 2000 },
      },
      resolve: transformVideo({
        transformer: ffmpeg.createH265,
        codec: `h265`,
      }),
    },
    videoWebP: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
      },
      resolve: transformVideo({
        transformer: ffmpeg.createWebP,
        codec: `webP`,
      }),
    },
    videoGif: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
      },
      resolve: transformVideo({
        transformer: ffmpeg.createGif,
        codec: `gif`,
      }),
    },
  }

  const resolvers = {
    ContentfulAsset: videoFields,
    File: videoFields,
  }
  createResolvers(resolvers)
}
