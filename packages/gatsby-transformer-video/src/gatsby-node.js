import { resolve, parse } from "path"

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
  screenshots: { type: GraphQLString },
  screenshotWidth: { type: GraphQLInt, defaultValue: 600 },
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
        screenshots: `[GatsbyVideoScreenshot]`,
      },
    }),
    schema.buildObjectType({
      name: `GatsbyVideoScreenshot`,
      fields: {
        path: GraphQLString,
        absolutePath: GraphQLString,
      },
    }),
  ]

  createTypes(typeDefs)
}

exports.createResolvers = async (
  { createResolvers, store, cache, createNodeId, actions },
  { ffmpegPath, ffprobePath, profiles = {} }
) => {
  const { createNode } = actions

  const program = store.getState().program
  const rootDir = program.directory
  const cacheDir = resolve(rootDir, `.cache`, `gatsby-transformer-video`)
  await ensureDir(cacheDir)

  const ffmpeg = new FFMPEG({
    rootDir,
    cacheDir,
    ffmpegPath,
    ffprobePath,
    profiles,
  })

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

    const { path, filename: name, info } = metadata
    const publicDir = resolve(rootDir, `public`, fieldArgs.publicPath)

    await ensureDir(publicDir)

    return {
      publicDir,
      path,
      name,
      info,
    }
  }

  // Analyze the resulting video and prepare field return values
  async function processResult({ publicPath, screenshots }) {
    const result = await ffmpeg.executeFfprobe(publicPath)

    const {
      format_name: formatName,
      format_long_name: formatLongName,
      start_time: startTime,
      duration: duration,
      size: size,
      bit_rate: bitRate,
    } = result.format

    const path = publicPath.replace(resolve(rootDir, `public`), ``)

    const { name, ext } = parse(publicPath)

    return {
      path,
      absolutePath: publicPath,
      name,
      ext,
      formatName,
      formatLongName,
      startTime: startTime === `N/A` ? null : startTime,
      duration: duration === `N/A` ? null : duration,
      size: size === `N/A` ? null : size,
      bitRate: bitRate === `N/A` ? null : bitRate,
      screenshots,
    }
  }

  // Transform video with a given transformer & codec
  function transformVideo({ transformer }) {
    return async (video, fieldArgs) => {
      try {
        const { publicDir, path, name, info } = await prepareAndAnalyzeVideo({
          video,
          fieldArgs,
        })

        const videoData = await transformer({
          publicDir,
          path,
          name,
          fieldArgs,
          info,
        })

        return await processResult(videoData)
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
        crf: { type: GraphQLInt, defaultValue: 31 },
        preset: { type: GraphQLString, defaultValue: `slow` },
        maxRate: { type: GraphQLString },
        bufSize: { type: GraphQLString },
      },
      resolve: transformVideo({
        transformer: ffmpeg.createH264,
      }),
    },
    videoH265: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
        crf: { type: GraphQLInt, defaultValue: 36 },
        preset: { type: GraphQLString, defaultValue: `fast` },
        maxRate: { type: GraphQLInt },
        bufSize: { type: GraphQLInt },
      },
      resolve: transformVideo({
        transformer: ffmpeg.createH265,
      }),
    },
    videoVP9: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
        crf: { type: GraphQLInt, defaultValue: 31 },
        bitrate: { type: GraphQLString },
        minrate: { type: GraphQLString },
        maxrate: { type: GraphQLString },
        cpuUsed: { type: GraphQLInt, defaultValue: 1 },
      },
      resolve: transformVideo({
        transformer: ffmpeg.createVP9,
      }),
    },
    videoWebP: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
      },
      resolve: transformVideo({
        transformer: ffmpeg.createWebP,
      }),
    },
    videoGif: {
      type: `GatsbyVideo`,
      args: {
        ...DEFAULT_ARGS,
      },
      resolve: transformVideo({
        transformer: ffmpeg.createGif,
      }),
    },
    videoProfile: {
      type: `GatsbyVideo`,
      args: {
        profile: { type: GraphQLString },
        ...DEFAULT_ARGS,
      },
      resolve: transformVideo({
        transformer: ffmpeg.createFromProfile,
      }),
    },
  }

  const resolvers = {
    ContentfulAsset: videoFields,
    File: videoFields,
  }
  createResolvers(resolvers)
}
