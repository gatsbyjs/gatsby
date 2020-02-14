module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `videos`,
        path: `${__dirname}/videos/`,
      },
    },
    {
      resolve: `gatsby-transformer-video`,
      options: {
        profiles: {
          sepia: {
            extension: `mp4`,
            converter: function({ ffmpegSession, videoStreamMetadata }) {
              const { currentFps } = videoStreamMetadata

              const outputOptions = [
                `-crf 31`,
                `-preset slow`,
                `-movflags +faststart`,
                `-profile:v high`,
                `-bf 2	`,
                `-g ${Math.floor(currentFps / 2)}`,
                `-coder 1`,
                `-pix_fmt yuv420p`,
              ].filter(Boolean)

              return ffmpegSession
                .videoCodec(`libx264`)
                .videoFilters(
                  `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
                )
                .outputOptions(outputOptions)
                .noAudio()
            },
          },
        },
      },
    },
  ],
}
