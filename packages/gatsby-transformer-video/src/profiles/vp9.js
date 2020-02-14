export default function profileVP9({
  ffmpegSession,
  filters,
  fieldArgs,
  videoStreamMetadata,
}) {
  const { crf, bitrate, minrate, maxrate, cpuUsed } = fieldArgs
  const { currentFps, videoStream } = videoStreamMetadata

  // Automatically determine fitting bitrates, based on:
  // https://developers.google.com/media/vp9/settings/vod/#bitrate
  const bitrateMap = {
    240: {
      30: [`150k`, `75k`, `218k`],
    },
    360: {
      30: [`276k`, `138k`, `400k`],
    },
    480: {
      30: [`750k`, `375k`, `1088k`],
    },
    720: {
      30: [`1024k`, `512k`, `1485k`],
      60: [`1800k`, `900k`, `2610k`],
    },
    1080: {
      30: [`1800k`, `900k`, `2610k`],
      60: [`3000k`, `1500k`, `4350k`],
    },
    1440: {
      30: [`6000k`, `3000k`, `8700k`],
      60: [`9000k`, `4500k`, `13050k`],
    },
    2160: {
      30: [`12000k`, `6000k`, `17400k`],
      60: [`18000k`, `9000k`, `26100k`],
    },
  }

  const dimensionMin = Math.min(videoStream.width, videoStream.height)
  const appliedFps = fieldArgs.fps || currentFps

  const closestResolution = Object.keys(bitrateMap).reduce((prev, curr) =>
    Math.abs(curr - dimensionMin) < Math.abs(prev - dimensionMin) ? curr : prev
  )

  const closestFps = Object.keys(
    bitrateMap[closestResolution]
  ).reduce((prev, curr) =>
    Math.abs(curr - appliedFps) < Math.abs(prev - appliedFps) ? curr : prev
  )

  const appliedBitrate = bitrate || bitrateMap[closestResolution][closestFps][0]
  const appliedMinrate = minrate || bitrateMap[closestResolution][closestFps][1]
  const appliedMaxrate = maxrate || bitrateMap[closestResolution][closestFps][2]

  const outputOptions = [
    crf && `-crf ${crf}`,
    `-b:v ${appliedBitrate}`,
    `-minrate ${appliedMinrate}`,
    `-maxrate ${appliedMaxrate}`,
    `-cpu-used ${cpuUsed}`,
    `-g ${appliedFps * 8}`,
    `-pix_fmt yuv420p`,
  ].filter(Boolean)

  return ffmpegSession
    .videoCodec(`libvpx-vp9`)
    .complexFilter([filters])
    .outputOptions(outputOptions)
    .audioCodec(`libopus`)
}
