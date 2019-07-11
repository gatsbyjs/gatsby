import crypto from "crypto"
import http from "http"
import { tmpdir } from "os"
import { resolve, parse } from "path"

import { pathExists, createWriteStream, ensureDir, unlink } from "fs-extra"
import ffmpeg from "fluent-ffmpeg"
import imagemin from "imagemin"
import imageminGiflossy from "imagemin-giflossy"
import PQueue from "p-queue"

export default class FFMPEG {
  constructor({ cacheDir, rootDir, ffmpegPath, ffprobePath }) {
    this.queue = new PQueue({ concurrency: 1 })
    this.cacheDir = cacheDir
    this.rootDir = rootDir

    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath)
    }
    if (ffprobePath) {
      ffmpeg.setFfprobePath(ffprobePath)
    }
  }

  cacheVideo = async ({
    id,
    contentful_id: cid,
    file: { url, fileName },
    internal: { contentDigest },
  }) => {
    await ensureDir(this.cacheDir)

    const { name, ext } = parse(fileName)
    const absolutePath = resolve(
      this.cacheDir,
      `${name}-${contentDigest}${ext}`
    )

    const alreadyExists = await pathExists(absolutePath)

    if (!alreadyExists) {
      const previewUrl = `http:${url}`

      console.log(`Downloading ${fileName} (${cid || id}) from ${previewUrl}`)

      try {
        await new Promise((resolve, reject) => {
          const file = createWriteStream(absolutePath)
          http
            .get(previewUrl, function(response) {
              response.pipe(file)
              file.on(`finish`, function() {
                file.close(resolve)
              })
            })
            .on(`error`, function(err) {
              reject(err)
            })
        })
      } catch (err) {
        await unlink(absolutePath)
        throw err
      }

      console.log(`Finished downloading ${fileName} (${cid || id})`)
    }

    return absolutePath
  }

  analyzeVideo = async ({ video, fieldArgs, type }) => {
    let path

    if (type === `File`) {
      path = video.absolutePath
    }

    if (type === `ContentfulAsset`) {
      path = await this.queue.add(() => this.cacheVideo(video))
    }

    if (!path) {
      throw new Error(
        `Unable to extract asset file path for ${type} (${video.id})`
      )
    }

    const optionsHash = crypto
      .createHash(`md5`)
      .update(JSON.stringify(fieldArgs))
      .digest(`hex`)

    const filename = `${video.internal.contentDigest}-${optionsHash}`

    const info = await new Promise((resolve, reject) => {
      ffmpeg(path).ffprobe(function(err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })

    return { path, filename, info }
  }

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
        .on(`error`, function(err) {
          console.log(`[FFMPEG] An error occurred: ` + err.message)
          reject(err)
        })
        .on(`end`, function() {
          console.log(`[FFMPEG] Finished`)
          resolve()
        })
        .save(publicPath)
    })
  }

  createPreviewFilters = ({ fieldArgs: { width, duration, fps }, info }) => {
    const { duration: sourceDuration } = info.streams[0]
    return [
      {
        filter: `setpts`,
        options: `${(duration / sourceDuration).toFixed(6)}*PTS`,
        inputs: `rescaled`,
        outputs: `speed-up`,
      },
      {
        filter: `fps`,
        options: fps,
        inputs: `speed-up`,
        outputs: `output`,
      },
      {
        // @todo make sure this is configurable
        filter: `eq`,
        options: `saturation=0`,
        outputs: `desaturated`,
      },
      {
        filter: `scale`,
        options: `${width}:-2:flags=lanczos`,
        inputs: `desaturated`,
        outputs: `rescaled`,
      },
    ]
  }

  createPreviewMp4 = (...args) =>
    this.queue.add(() => this.convertToPreviewMp4(...args))
  convertToPreviewMp4 = async ({
    publicDir,
    path,
    filename,
    fieldArgs,
    info,
  }) => {
    const { duration } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-preview.mp4`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[MP4] Converting ${path} (${filename})`)
      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libx264`)
        .duration(duration)
        .complexFilter(this.createPreviewFilters({ fieldArgs, info }), `output`)
        .outputOptions([
          `-c:v libx264`,
          `-crf 34`,
          `-preset veryslow`,
          `-pix_fmt yuv420p`,
        ])

      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[MP4] Done`)
    }

    return publicPath.replace(`${this.rootDir}/public`, ``)
  }

  createPreviewWebp = (...args) =>
    this.queue.add(() => this.convertToPreviewWebp(...args))
  convertToPreviewWebp = async ({
    publicDir,
    path,
    filename,
    fieldArgs,
    info,
  }) => {
    const { duration } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-preview.webp`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[WEBP] Converting ${path} (${filename})`)
      const ffmpegSession = ffmpeg()
        .input(path)
        .duration(duration)
        .videoCodec(`libwebp`)
        .complexFilter(this.createPreviewFilters({ fieldArgs, info }), `output`)
        .outputOptions([`-preset picture`, `-compression_level 6`, `-loop 0`])

      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[WEBP] Done`)
    }

    return publicPath.replace(`${this.rootDir}/public`, ``)
  }

  createPreviewGif = (...args) =>
    this.queue.add(() => this.convertToPreviewGif(...args))
  convertToPreviewGif = async ({
    publicDir,
    path,
    filename,
    fieldArgs,
    info,
  }) => {
    const { duration } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-preview.gif`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      const tmpPath = resolve(tmpdir(), `${filename}-preview.gif`)

      console.log(`[GIF] Converting ${path} (${filename})`)
      const ffmpegSession = ffmpeg()
        .input(path)
        .duration(duration)
        .complexFilter([
          ...this.createPreviewFilters({ fieldArgs, info }),
          {
            filter: `split`,
            inputs: `output`,
            outputs: [`o1`, `o2`],
          },
          {
            filter: `palettegen`,
            inputs: `o1`,
            outputs: `p`,
          },
          {
            filter: `fifo`,
            inputs: `o2`,
            outputs: `o3`,
          },
          {
            filter: `paletteuse`,
            inputs: [`o3`, `p`],
          },
        ])

      await this.executeFfmpeg(ffmpegSession, tmpPath)

      console.log(`[GIF] Optimizing`)
      await imagemin([tmpPath], {
        destination: publicDir,
        use: [imageminGiflossy({ lossy: 120 })],
      })

      console.log(`[GIF] Done`)
    }

    return publicPath.replace(`${this.rootDir}/public`, ``)
  }

  createH264 = (...args) => this.queue.add(() => this.convertToH264(...args))
  convertToH264 = async ({ publicDir, path, filename, fieldArgs }) => {
    const { maxWidth, maxHeight } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-h264.mp4`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[H264] Converting ${path} (${filename})`)

      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libx264`)
        .complexFilter([
          {
            filter: `scale`,
            options: `iw*min(1\\,min(${maxWidth}/iw\\,${maxHeight}/ih)):-2`,
          },
        ])
        .outputOptions([`-crf 28`, `-preset veryslow`, `-pix_fmt yuv420p`])

      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[H264] Done`)
    }

    return publicPath.replace(`${this.rootDir}/public`, ``)
  }

  createH265 = (...args) => this.queue.add(() => this.convertToH265(...args))
  convertToH265 = async ({ publicDir, path, filename, fieldArgs }) => {
    const { maxWidth, maxHeight } = fieldArgs

    const publicPath = resolve(publicDir, `${filename}-h265.mp4`)
    const alreadyExists = await pathExists(publicPath)
    if (!alreadyExists) {
      console.log(`[H265] Converting ${path} (${filename})`)
      const ffmpegSession = ffmpeg()
        .input(path)
        .videoCodec(`libx265`)
        .complexFilter([
          {
            filter: `scale`,
            options: `iw*min(1\\,min(${maxWidth}/iw\\,${maxHeight}/ih)):-2`,
          },
        ])
        .outputOptions([`-crf 34`, `-preset veryslow`, `-pix_fmt yuv420p`])

      await this.executeFfmpeg(ffmpegSession, publicPath)

      console.log(`[H265] Done`)
    }

    return publicPath.replace(`${this.rootDir}/public`, ``)
  }
}
