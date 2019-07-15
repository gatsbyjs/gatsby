import { resolve, join } from "path"

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from "gatsby/graphql"
import { ensureDir } from "fs-extra"

import FFMPEG from "./ffmpeg"

exports.setFieldsOnGraphQLNodeType = (
  { type, store },
  { ffmpegPath, ffprobePath }
) => {
  if (![`File`, `ContentfulAsset`].includes(type.name)) {
    return {}
  }

  const program = store.getState().program
  const rootDir = program.directory

  const cacheDir = resolve(
    `${rootDir}/node_modules/.cache/gatsby-transformer-video/`
  )

  const ffmpeg = new FFMPEG({ cacheDir, rootDir, ffmpegPath, ffprobePath })

  async function prepareVideo({ video, fieldArgs }) {
    const { type } = video.internal

    let fileType = null
    if (type === `File`) {
      fileType = video.internal.mediaType
    }

    if (type === `ContentfulAsset`) {
      fileType = video.internal.mediaType
    }

    if (!fileType) {
      throw new Error(
        `Unable to extract asset file type for ${type} (${video.id})`
      )
    }

    if (fileType.indexOf(`video/`) === -1) {
      return false
    }

    return ffmpeg.analyzeVideo({
      type,
      video,
      fieldArgs,
    })
  }

  return {
    videoPreview: {
      type: new GraphQLObjectType({
        name: `TransformerVideoPreview${type.name}`,
        fields: {
          mp4: { type: GraphQLString },
          webp: { type: GraphQLString },
          gif: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: { type: GraphQLInt, defaultValue: 560 },
        maxHeight: { type: GraphQLInt, defaultValue: null },
        duration: { type: GraphQLInt, defaultValue: 3 },
        fps: { type: GraphQLInt, defaultValue: 3 },
        saturation: { type: GraphQLFloat, defaultValue: 1 },
        overlay: { type: GraphQLString, defaultValue: null },
        overlayX: { type: GraphQLString, defaultValue: `center` },
        overlayY: { type: GraphQLString, defaultValue: `center` },
        overlayPadding: { type: GraphQLInt, defaultValue: 10 },
        publicPath: {
          type: GraphQLString,
          defaultValue: `assets/video-previews`,
        },
        h264Crf: { type: GraphQLInt, defaultValue: 34 },
        h264Preset: { type: GraphQLString, defaultValue: `veryslow` },
      },
      async resolve(video, fieldArgs) {
        const metadata = await prepareVideo({
          video,
          fieldArgs,
        })

        if (!metadata) {
          return null
        }

        const { path, filename, info } = metadata

        const publicDir = join(rootDir, `public`, fieldArgs.publicPath)

        await ensureDir(publicDir)

        try {
          const mp4 = await ffmpeg.createPreviewMp4({
            publicDir,
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const webp = await ffmpeg.createPreviewWebp({
            publicDir,
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const gif = await ffmpeg.createPreviewGif({
            publicDir,
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          return {
            mp4,
            webp,
            gif,
          }
        } catch (err) {
          console.error(err)
          throw err
        }
      },
    },
    video: {
      type: new GraphQLObjectType({
        name: `TransformerVideoVideo${type.name}`,
        fields: {
          h264: { type: GraphQLString },
          h265: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: { type: GraphQLInt, defaultValue: 1920 },
        maxHeight: { type: GraphQLInt, defaultValue: null },
        saturation: { type: GraphQLFloat, defaultValue: 1 },
        overlay: { type: GraphQLString, defaultValue: null },
        overlayX: { type: GraphQLString, defaultValue: `center` },
        overlayY: { type: GraphQLString, defaultValue: `center` },
        overlayPadding: { type: GraphQLInt, defaultValue: 10 },
        publicPath: { type: GraphQLString, defaultValue: `assets/videos` },
        h264Crf: { type: GraphQLInt, defaultValue: 28 },
        h264Preset: { type: GraphQLString, defaultValue: `veryslow` },
        h265Crf: { type: GraphQLInt, defaultValue: 34 },
        h265Preset: { type: GraphQLString, defaultValue: `veryslow` },
      },
      async resolve(video, fieldArgs) {
        const metadata = await prepareVideo({
          video,
          fieldArgs,
        })

        if (!metadata) {
          return null
        }

        const { path, filename, info } = metadata

        const publicDir = join(rootDir, `public`, fieldArgs.publicPath)

        await ensureDir(publicDir)

        try {
          const h264 = await ffmpeg.createH264({
            publicDir,
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const h265 = await ffmpeg.createH265({
            publicDir,
            path,
            filename,
            info,
            fieldArgs,
            video,
          })

          return {
            h264,
            h265,
          }
        } catch (err) {
          console.error(err)
          throw err
        }
      },
    },
  }
}
