export default function profileH264({
  ffmpegSession,
  filters,
  fieldArgs,
  videoStreamMetadata,
}) {
  const { crf, preset, maxRate, bufSize, fps } = fieldArgs
  const { currentFps } = videoStreamMetadata

  const outputOptions = [
    crf && `-crf ${crf}`,
    preset && `-preset ${preset}`,
    !crf && maxRate && `-maxrate ${maxRate}`,
    !crf && bufSize && `-bufsize ${bufSize}`,
    `-movflags +faststart`,
    `-profile:v high`,
    `-bf 2	`,
    `-g ${Math.floor((fps || currentFps) / 2)}`,
    `-coder 1`,
    `-pix_fmt yuv420p`,
  ].filter(Boolean)

  return (
    ffmpegSession
      .videoCodec(`libx264`)
      .complexFilter([filters])
      .outputOptions(outputOptions)
      .audioCodec(`aac`)
      .audioQuality(5)
      // Apple devices support aac only with stereo
      .audioChannels(2)
  )
}
