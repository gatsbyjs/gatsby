import { resolve } from "path"

import { GraphQLObjectType, GraphQLString, GraphQLInt } from "gatsby/graphql"

import FFMPEG from "./ffmpeg"

exports.setFieldsOnGraphQLNodeType = ({ type, store }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }
  // @todo make configurable
  const cacheDir = resolve(
    `${program.directory}/node_modules/.cache/gatsby-transformer-video/`
  )
  // @todo make configurable
  const publicDir = resolve(`${program.directory}/public/assets/videos/`)

  const program = store.getState().program
  const rootDir = program.directory

  const ffmpeg = new FFMPEG({ publicDir, cacheDir, rootDir })

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
      },
      async resolve(video, fieldArgs, context) {
        if (video.file.contentType.indexOf(`video/`) === -1) {
          return null
        }

        const { path, filename, info } = await ffmpeg.prepareVideo({
          video,
          fieldArgs,
        })

        try {
          const mp4 = await ffmpeg.createPreviewMp4({
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const webp = await ffmpeg.createPreviewWebp({
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const gif = await ffmpeg.createPreviewGif({
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
      },
      async resolve(video, fieldArgs, context) {
        if (video.file.contentType.indexOf(`video/`) === -1) {
          return null
        }

        const { path, filename, info } = await ffmpeg.prepareVideo({
          video,
          fieldArgs,
        })

        try {
          const h264 = await ffmpeg.createH264({
            path,
            filename,
            info,
            fieldArgs,
            video,
          })
          const h265 = await ffmpeg.createH265({
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
