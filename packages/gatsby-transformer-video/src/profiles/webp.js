export default function profileWebP({ ffmpegSession, filters }) {
  const outputOptions = [
    `-preset picture`,
    `-compression_level 6`,
    `-loop 0`,
  ].filter(Boolean)

  return ffmpegSession
    .videoCodec(`libwebp`)
    .complexFilter([filters])
    .outputOptions(outputOptions)
    .noAudio()
}
