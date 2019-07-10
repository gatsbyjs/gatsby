import { resolve, join } from "path"

import { GraphQLObjectType, GraphQLString, GraphQLInt } from "gatsby/graphql"
import { ensureDir } from "fs-extra"

import FFMPEG from "./ffmpeg"

exports.setFieldsOnGraphQLNodeType = ({ type, store }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const program = store.getState().program
  const rootDir = program.directory

  const cacheDir = resolve(
    `${rootDir}/node_modules/.cache/gatsby-transformer-video/`
  )

  const ffmpeg = new FFMPEG({ cacheDir, rootDir })

  return {
    videopreview: {
      type: new GraphQLObjectType({
        name: `TransfomerVideoPreview`,
        fields: {
          mp4: { type: GraphQLString },
          webp: { type: GraphQLString },
          gif: { type: GraphQLString },
        },
      }),
      args: {
        width: { type: GraphQLInt, defaultValue: 300 },
        duration: { type: GraphQLInt, defaultValue: 5 },
        fps: { type: GraphQLInt, defaultValue: 6 },
        publicPath: {
          type: GraphQLString,
          defaultValue: `assets/video-previews`,
        },
      },
      async resolve(video, fieldArgs, context) {
        if (video.file.contentType.indexOf(`video/`) === -1) {
          return null
        }

        const { path, filename, info } = await ffmpeg.analyzeVideo({
          video,
          fieldArgs,
        })

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
        name: `TransfomerVideoVideo`,
        fields: {
          h264: { type: GraphQLString },
          h265: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: { type: GraphQLInt, defaultValue: 1920 },
        maxHeight: { type: GraphQLInt, defaultValue: 1080 },
        publicPath: { type: GraphQLString, defaultValue: `assets/videos` },
      },
      async resolve(video, fieldArgs, context) {
        if (video.file.contentType.indexOf(`video/`) === -1) {
          return null
        }

        const { path, filename, info } = await ffmpeg.analyzeVideo({
          video,
          fieldArgs,
        })

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
