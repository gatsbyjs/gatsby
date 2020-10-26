import { resolve, parse } from "path"
import os from "os"

import { ensureDir } from "fs-extra"
import { GraphQLString, GraphQLInt, GraphQLFloat } from "gatsby/graphql"
import reporter from "gatsby-cli/lib/reporter"

import FFMPEG from "./ffmpeg"

import { libsInstalled, libsAlreadyDownloaded, downloadLibs } from "./binaries"

const platform = os.platform()
const arch = os.arch()

const CACHE_FOLDER_BIN = resolve(
  `node_modules`,
  `.cache`,
  `gatsby-transformer-video-bin`,
  `${platform}-${arch}`
)
const CACHE_FOLDER_VIDEOS = resolve(
  `node_modules`,
  `.cache`,
  `gatsby-transformer-video`
)

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
    defaultValue: `static/videos`,
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

exports.createResolvers = async (
  { createResolvers, store, getCache, createNodeId, actions: { createNode } },
  { ffmpegPath, ffprobePath, downloadBinaries = true, profiles = {} }
) => {
  const program = store.getState().program
  const rootDir = program.directory
  const cacheDirOriginal = resolve(rootDir, CACHE_FOLDER_VIDEOS, `original`)
  const cacheDirConverted = resolve(rootDir, CACHE_FOLDER_VIDEOS, `converted`)

  await ensureDir(cacheDirOriginal)
  await ensureDir(cacheDirConverted)

  const alreadyInstalled = await libsInstalled({ platform })

  // Set paths to our own binaries
  if (!alreadyInstalled && downloadBinaries && (!ffmpegPath || !ffprobePath)) {
    ffmpegPath = resolve(
      rootDir,
      CACHE_FOLDER_BIN,
      `ffmpeg${platform === `win32` ? `.exe` : ``}`
    )
    ffprobePath = resolve(
      rootDir,
      CACHE_FOLDER_BIN,
      `ffprobe${platform === `win32` ? `.exe` : ``}`
    )
  }

  const ffmpeg = new FFMPEG({
    rootDir,
    cacheDirOriginal,
    cacheDirConverted,
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
      video,
      fieldArgs,
      type,
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
  async function processResult({ publicPath }) {
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
        crf: { type: GraphQLInt, defaultValue: 28 },
        preset: { type: GraphQLString, defaultValue: `medium` },
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
        crf: { type: GraphQLInt, defaultValue: 31 },
        preset: { type: GraphQLString, defaultValue: `medium` },
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
    videoScreenshots: {
      type: `[File]`,
      args: {
        timestamps: { type: [GraphQLString], defaultValue: [`0`] },
        width: { type: GraphQLInt, defaultValue: 600 },
      },
      resolve: (video, fieldArgs) =>
        ffmpeg.takeScreenshots(video, fieldArgs, {
          getCache,
          createNode,
          createNodeId,
        }),
    },
  }

  const resolvers = {
    ContentfulAsset: videoFields,
    File: videoFields,
  }
  createResolvers(resolvers)
}

exports.onPreInit = async ({ store }, { downloadBinaries = true }) => {
  if (!downloadBinaries) {
    reporter.verbose(`Skipped download of FFMPEG & FFPROBE binaries`)
    return
  }

  const alreadyInstalled = await libsInstalled({ platform })

  if (alreadyInstalled) {
    reporter.verbose(`FFMPEG && FFPROBE are already available on this machine`)
    return
  }

  const arch = os.arch()
  const program = store.getState().program
  const rootDir = program.directory
  const binariesDir = resolve(rootDir, CACHE_FOLDER_BIN)

  try {
    await libsAlreadyDownloaded({ binariesDir })

    reporter.verbose(`FFMPEG & FFPROBE binaries already downloaded`)
  } catch {
    try {
      reporter.info(`FFMPEG & FFPROBE getting binaries for ${platform}@${arch}`)

      await downloadLibs({ binariesDir, platform })

      reporter.info(
        `Finished. This system is ready to convert videos with GatsbyJS`
      )
    } catch (err) {
      throw err
    }
  }
}
