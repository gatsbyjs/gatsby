import { tmpdir } from "os"
import { resolve, parse } from "path"

import { createContentDigest } from "gatsby-core-utils"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { pathExists } from "fs-extra"
import ffmpeg from "fluent-ffmpeg"
import imagemin from "imagemin"
import imageminGiflossy from "imagemin-giflossy"
import PQueue from "p-queue"

export default class FFMPEG {
  constructor({ rootDir, ffmpegPath, ffprobePath }) {
    this.queue = new PQueue({ concurrency: 1 })
    this.cacheDir = resolve(
      `${rootDir}/node_modules/.cache/gatsby-transformer-video/`
    )
    this.rootDir = rootDir

    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath)
    }
    if (ffprobePath) {
      ffmpeg.setFfprobePath(ffprobePath)
    }
  }

  analyzeVideo = async ({
    video,
    fieldArgs,
    type,
    store,
    cache,
    createNode,
    createNodeId,
  }) => {
    let path

    if (type === `File`) {
      path = video.absolutePath
    }

    if (type === `ContentfulAsset`) {
      const {
        file: { url, fileName },
      } = video
      const { ext } = parse(fileName)
      // Download video from Contentful for further processing
      path = await this.queue.add(async () => {
        const fileNode = await createRemoteFileNode({
          url: `https:${url}`,
          store,
          cache,
          createNode,
          createNodeId,
          ext,
        })
        return fileNode.absolutePath
      })
    }

    if (!path) {
      throw new Error(
        `Unable to extract asset file path for ${type} (${video.id})`
      )
    }

    const optionsHash = createContentDigest(fieldArgs)

    const filename = `${video.internal.contentDigest}-${optionsHash}`

    const info = await this.executeFfprobe(path)

    return { path, filename, info }
  }

  executeFfprobe = path =>
    new Promise((resolve, reject) => {
      ffmpeg(path).ffprobe(function(err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })

  executeFfmpeg = async (ffmpegSession, publicPath) => {
    let lastLoggedPercent = -10
    return new Promise((resolve, reject) => {
      ffmpegSession
        .on(`start`, function() {
          console.log(`[FFMPEG] Spawned`)
        })
        .on(`progress`, function(progress) {
          if (progress.percent > lastLoggedPercent + 10) {
            console.log(
              `[FFMPEG] frames: ${progress.frames} - ${progress.percent}%`
            )
            lastLoggedPercent = progress.percent
          }
        })
        .on(`error`, function(err, stdout, stderr) {
          console.log(`\n---\n`, stdout, stderr, `\n---\n`)
          console.log(`[FFMPEG] An error occurred: ` + err.message)
          reject(err)
        })
        .on(`end`, function(stdout, stderr) {
          console.log(`\n---\n`, stdout, stderr, `\n---\n`)
          console.log(`[FFMPEG] Finished`)
          resolve()
        })
        .save(publicPath)
    })
  }

  // Generate ffmpeg filters based on field args
  createFilters = ({ fieldArgs, info }) => {
    const {
      maxWidth,
      maxHeight,
      duration,
      fps,
      saturation,
      overlay,
      overlayX,
      overlayY,
      overlayPadding,
    } = fieldArgs
    const filters = []
    const { duration: sourceDuration } = info.streams[0]

    if (duration) {
      filters.push(`setpts=${(duration / sourceDuration).toFixed(6)}*PTS`)
    }

    if (fps) {
      filters.push(`fps=${fps}`)
    }

    if (maxWidth || maxHeight) {
      filters.push(`scale=${this.generateScaleFilter({ maxWidth, maxHeight })}`)
    }

    if (saturation !== 1) {
      filters.push(`eq=saturation=${saturation}`)
    }

    if (overlay) {
      const padding = overlayPadding === undefined ? 10 : overlayPadding
      let x = overlayX === undefined ? `center` : overlayX
      let y = overlayY === undefined ? `center` : overlayY

      if (x === `start`) {
        x = padding
      }
      if (x === `center`) {
        x = `(main_w-overlay_w)/2`
      }
      if (x === `end`) {
        x = `main_w-overlay_w-${padding}`
      }

      if (y === `start`) {
        y = padding
      }
      if (y === `center`) {
        y = `(main_h-overlay_h)/2`
      }
      if (y === `end`) {
        y = `main_h-overlay_h-${padding}`
      }

      filters.push(`overlay=x=${x}:y=${y}`)
    }

    return filters
  }

  // Apply required changes from some filters to the fluent-ffmpeg session
  enhanceFfmpegForFilters = ({
    fieldArgs: { overlay, duration },
    ffmpegSession,
  }) => {
    if (duration) {
      ffmpegSession.duration(duration).noAudio()
    }
    if (overlay) {
      const path = resolve(this.rootDir, overlay)
      ffmpegSession.input(path)
    }
  }

  createH264 = (...args) => this.queue.add(() => this.convertToH264(...args))
  convertToH264 = async ({ publicDir, path, filename, fieldArgs, info }) => {
    const { crf, preset, maxRate, bufSize } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-h264.mp4`)

    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[H264] Converting ${path} (${filename})`)

      const filters = this.createFilters({ fieldArgs, info }).join(`,`)

      console.log(`Applied complex filter: ${filters}`)

      const currentFps = parseInt(
        info.streams
          .find(stream => stream.codec_type === `video`)
          .r_frame_rate.split(`/`)[0]
      )

      const outputOptions = [
        crf && `-crf ${crf}`,
        preset && `-preset ${preset}`,
        !crf && maxRate && `-maxrate ${maxRate}`,
        !crf && bufSize && `-bufsize ${bufSize}`,
        `-movflags +faststart`,
        `-profile:v high`,
        `-bf 2	`,
        `-g ${Math.floor((fieldArgs.fps || currentFps) / 2)}`,
        `-coder 1`,
        `-pix_fmt yuv420p`,
      ].filter(Boolean)

      console.log(
        `ffmpeg command:\n\nffmpeg -i ${path} -vf "${filters}" -c:v libx264 ${outputOptions.join(
          ` `
        )} ${publicPath} \n\n`
      )

      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libx264`)
        .complexFilter([filters])
        .outputOptions(outputOptions)
        .audioCodec(`aac`)
        .audioQuality(5)
        // Apple devices support aac only with stereo
        .audioChannels(2)

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[H264] Done`)
    }

    return publicPath
  }

  createH265 = (...args) => this.queue.add(() => this.convertToH265(...args))
  convertToH265 = async ({ publicDir, path, filename, fieldArgs, info }) => {
    const { crf, preset, maxRate, bufSize } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-h265.mp4`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[H265] Converting ${path} (${filename})`)

      const filters = this.createFilters({ fieldArgs, info }).join(`,`)

      console.log(`Applied complex filter: ${filters}`)

      const currentFps = parseInt(
        info.streams
          .find(stream => stream.codec_type === `video`)
          .r_frame_rate.split(`/`)[0]
      )

      const outputOptions = [
        crf && `-crf ${crf}`,
        preset && `-preset ${preset}`,
        !crf &&
          maxRate &&
          bufSize &&
          `-x265-params vbv-maxrate=${maxRate}:vbv-bufsize=${bufSize}`,
        `-movflags +faststart`,
        `-bf 2`,
        `-g ${Math.floor((fieldArgs.fps || currentFps) / 2)}`,
        `-pix_fmt yuv420p`,
      ].filter(Boolean)

      console.log(
        `ffmpeg command:\n\nffmpeg -i ${path} -vf "${filters}" -c:v libx265 ${outputOptions.join(
          ` `
        )} ${publicPath} \n\n`
      )

      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libx265`)
        .complexFilter([filters])
        .outputOptions(outputOptions)
        .audioCodec(`aac`)
        .audioQuality(5)
        // Apple devices support aac only with stereo
        .audioChannels(2)

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[H265] Done`)
    }

    return publicPath
  }

  createVP9 = (...args) => this.queue.add(() => this.convertToVP9(...args))
  convertToVP9 = async ({ publicDir, path, filename, fieldArgs, info }) => {
    const { crf } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}.webm`)
    const alreadyExists = await pathExists(publicPath)

    if (!alreadyExists) {
      console.log(`[VP9] Converting ${path} (${filename})`)

      const filters = this.createFilters({ fieldArgs, info }).join(`,`)

      console.log(`Applied complex filter: ${filters}`)

      const currentFps = parseInt(
        info.streams
          .find(stream => stream.codec_type === `video`)
          .r_frame_rate.split(`/`)[0]
      )

      const outputOptions = [
        crf && `-crf ${crf}`,
        `-b:v 0`,
        `-cpu-used 1`,
        `-g ${Math.floor((fieldArgs.fps || currentFps) / 2)}`,
        `-pix_fmt yuv420p`,
      ].filter(Boolean)

      console.log(
        `ffmpeg command:\n\nffmpeg -i ${path} -vf "${filters}" -c:v libvpx-vp9 ${outputOptions.join(
          ` `
        )} ${publicPath} \n\n`
      )

      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libvpx-vp9`)
        .complexFilter([filters])
        .outputOptions(outputOptions)
        .audioCodec(`libopus`)

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[VP9] Done`)
    }

    return publicPath
  }

  createWebP = (...args) => this.queue.add(() => this.convertToWebP(...args))
  convertToWebP = async ({ publicDir, path, filename, fieldArgs, info }) => {
    const publicPath = resolve(publicDir, `${filename}.webp`)
    const alreadyExists = await pathExists(publicPath)

    if (!alreadyExists) {
      console.log(`[WEBP] Converting ${path} (${filename})`)

      const filters = this.createFilters({ fieldArgs, info }).join(`,`)

      console.log(`Applied complex filter: ${filters}`)

      const outputOptions = [
        `-preset picture`,
        `-compression_level 6`,
        `-loop 0`,
      ].filter(Boolean)

      console.log(
        `ffmpeg command:\n\nffmpeg -i ${path} -vf "${filters}" -c:v libwebp ${outputOptions.join(
          ` `
        )} ${publicPath} \n\n`
      )

      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libwebp`)
        .complexFilter([filters])
        .outputOptions(outputOptions)
        .noAudio()

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[WEBP] Done`)
    }

    return publicPath
  }

  createGif = (...args) => this.queue.add(() => this.convertToGif(...args))
  convertToGif = async ({ publicDir, path, filename, fieldArgs, info }) => {
    const publicPath = resolve(publicDir, `${filename}.gif`)
    const alreadyExists = await pathExists(publicPath)

    if (!alreadyExists) {
      console.log(`[GIF] Converting ${path} (${filename})`)

      const tmpPath = resolve(tmpdir(), `${filename}.gif`)
      const filters = [
        ...this.createFilters({ fieldArgs, info }),
        // High quality gif: https://engineering.giphy.com/how-to-make-gifs-wit g/
        `split [a][b]`,
        `[a] palettegen [p]`,
        `[b][p] paletteuse`,
      ].join(`,`)

      console.log(`Applied complex filter: ${filters}`)

      console.log(
        `ffmpeg command:\n\nffmpeg -i ${path} -vf "${filters}" ${publicPath} \n\n`
      )

      const ffmpegSession = ffmpeg()
        .input(path)
        .complexFilter([filters])
        .noAudio()

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg(ffmpegSession, tmpPath)

      console.log(`[GIF] Optimizing`)

      await imagemin([tmpPath], {
        destination: publicDir,
        plugins: [
          imageminGiflossy({
            optimizationLevel: 3,
            lossy: 120,
            noLogicalScreen: true,
            optimize: `3`,
          }),
        ],
      })

      console.log(`[GIF] Done`)
    }

    return publicPath
  }

  // Helper functions
  generateScaleFilter({ maxWidth, maxHeight }) {
    if (!maxHeight) {
      return `'min(${maxWidth},iw)':-2:flags=lanczos`
    }
    return `'min(iw*min(1\\,min(${maxWidth}/iw\\,${maxHeight}/ih)), iw)':-2:flags=lanczos`
  }
}
