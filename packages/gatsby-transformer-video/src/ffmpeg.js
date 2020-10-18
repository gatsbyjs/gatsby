import { parse, resolve } from "path"
import { performance } from "perf_hooks"
import { tmpdir } from "os"

import { createContentDigest } from "gatsby-core-utils"
import { pathExists, stat, copy, ensureDir, remove, access } from "fs-extra"
import ffmpeg from "fluent-ffmpeg"
import imagemin from "imagemin"
import imageminGiflossy from "imagemin-giflossy"
import imageminMozjpeg from "imagemin-mozjpeg"
import PQueue from "p-queue"
import sharp from "sharp"
import { createFileNodeFromBuffer } from "gatsby-source-filesystem"

import { cacheContentfulVideo } from "./helpers"

import profileH264 from "./profiles/h264"
import profileH265 from "./profiles/h265"
import profileVP9 from "./profiles/vp9"
import profileWebP from "./profiles/webp"
import profileGif from "./profiles/gif"

export default class FFMPEG {
  constructor({
    rootDir,
    cacheDirOriginal,
    cacheDirConverted,
    ffmpegPath,
    ffprobePath,
    profiles,
  }) {
    this.queue = new PQueue({ concurrency: 1 })
    this.cacheDirOriginal = cacheDirOriginal
    this.cacheDirConverted = cacheDirConverted
    this.rootDir = rootDir
    this.profiles = profiles

    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath)
    }
    if (ffprobePath) {
      ffmpeg.setFfprobePath(ffprobePath)
    }
  }

  // Execute FFPROBE and return metadata
  executeFfprobe = path =>
    new Promise((resolve, reject) => {
      ffmpeg(path).ffprobe((err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

  // Execute FFMMPEG and log progress
  executeFfmpeg = async ({ ffmpegSession, cachePath, loggingPrefix }) => {
    let startTime
    let lastLoggedPercent = 0.1

    return new Promise((resolve, reject) => {
      ffmpegSession
        .on(`start`, commandLine => {
          console.log(`${loggingPrefix} Executing:\n\n${commandLine}\n`)
          startTime = performance.now()
        })
        .on(`progress`, progress => {
          if (progress.percent > lastLoggedPercent + 10) {
            const percent = Math.floor(progress.percent)
            const elapsedTime = Math.ceil(
              (performance.now() - startTime) / 1000
            )
            const estTotalTime = (100 / percent) * elapsedTime
            const estTimeLeft = Math.ceil(estTotalTime - elapsedTime)
            const loggedTimeLeft =
              estTimeLeft !== Infinity && ` (~${estTimeLeft}s)`

            console.log(`${loggingPrefix} ${percent}%${loggedTimeLeft}`)
            lastLoggedPercent = progress.percent
          }
        })
        .on(`error`, (err, stdout, stderr) => {
          console.log(`\n---\n`, stdout, stderr, `\n---\n`)
          console.log(`${loggingPrefix} An error occurred:`)
          console.error(err)
          reject(err)
        })
        .on(`end`, () => {
          console.log(`${loggingPrefix} 100%`)
          resolve()
        })
        .save(cachePath)
    })
  }

  // Analyze video and download if neccessary
  analyzeVideo = async ({ video, fieldArgs, type }) => {
    let path
    let contentDigest = video.internal.contentDigest

    if (type === `File`) {
      path = video.absolutePath
    }

    if (type === `ContentfulAsset`) {
      path = await cacheContentfulVideo({
        video,
        cacheDir: this.cacheDirOriginal,
      })
      contentDigest = createContentDigest([
        video.contentful_id,
        video.file.url,
        video.file.details.size,
      ])
    }

    if (!path) {
      throw new Error(
        `Unable to extract asset file path for ${type} (${video.id})`
      )
    }

    const optionsHash = createContentDigest(fieldArgs)

    const filename = `${contentDigest}-${optionsHash}`

    const info = await this.executeFfprobe(path)

    return { path, filename, info }
  }

  // Queue video for conversion
  queueConvertVideo = async (...args) => {
    const videoData = await this.queue.add(() => this.convertVideo(...args))

    return videoData
  }

  // Converts a video based on a given profile, populates cache and public dir
  convertVideo = async ({
    profile,
    sourcePath,
    cachePath,
    publicPath,
    fieldArgs,
    info,
  }) => {
    const alreadyExists = await pathExists(cachePath)

    if (!alreadyExists) {
      const loggingPrefix = `[FFMPEG]`
      const ffmpegSession = ffmpeg().input(sourcePath)
      const filters = this.createFilters({ fieldArgs, info }).join(`,`)
      const videoStreamMetadata = this.parseVideoStream(info.streams)

      profile({ ffmpegSession, filters, fieldArgs, videoStreamMetadata })

      this.enhanceFfmpegForFilters({ ffmpegSession, fieldArgs })
      await this.executeFfmpeg({ ffmpegSession, cachePath, loggingPrefix })
    }

    // If public file does not exist, copy cached file
    const publicExists = await pathExists(publicPath)

    if (!publicExists) {
      await copy(cachePath, publicPath)
    }

    // Check if public and cache file vary in size
    const cacheFileStats = await stat(cachePath)
    const publicFileStats = await stat(publicPath)

    if (publicExists && cacheFileStats.size !== publicFileStats.size) {
      await copy(cachePath, publicPath, { overwrite: true })
    }

    return { publicPath }
  }

  takeScreenshots = async (
    video,
    fieldArgs,
    { getCache, createNode, createNodeId }
  ) => {
    const { type } = video.internal

    let fileType = null
    if (type === `File`) {
      fileType = video.internal.mediaType
    }

    if (type === `ContentfulAsset`) {
      fileType = video.file.contentType
    }

    if (fileType.indexOf(`video/`) === -1) {
      return null
    }

    let path, fileName

    if (type === `File`) {
      path = video.absolutePath
      fileName = video.name
    }

    if (type === `ContentfulAsset`) {
      path = await cacheContentfulVideo({
        video,
        cacheDir: this.cacheDirOriginal,
      })
      fileName = video.file.fileName
    }

    const { timestamps, width } = fieldArgs
    const { name } = parse(fileName)

    const tmpDir = resolve(tmpdir(), `gatsby-transformer-video`, name)

    await ensureDir(tmpDir)

    let screenshotRawNames

    await new Promise((resolve, reject) => {
      ffmpeg(path)
        .on(`filenames`, function (filenames) {
          screenshotRawNames = filenames
          console.log(`[FFMPEG] Taking ${filenames.length} screenshots`)
        })
        .on(`error`, (err, stdout, stderr) => {
          console.log(`[FFMPEG] Failed to take screenshots:`)
          console.error(err)
          reject(err)
        })
        .on(`end`, () => {
          resolve()
        })
        .screenshots({
          timestamps,
          filename: `${name}-%ss.png`,
          folder: tmpDir,
          size: `${width}x?`,
        })
    })

    const screenshotNodes = []

    console.log({ screenshotRawNames, tmpDir })

    for (const screenshotRawName of screenshotRawNames) {
      try {
        const rawScreenshotPath = resolve(tmpDir, screenshotRawName)
        const { name } = parse(rawScreenshotPath)

        try {
          await access(rawScreenshotPath)
        } catch {
          console.warn(`Screenshot ${rawScreenshotPath} could not be found!`)
          continue
        }

        const jpgBuffer = await sharp(rawScreenshotPath)
          .jpeg({
            quality: 80,
            progressive: true,
          })
          .toBuffer()

        const optimizedBuffer = await imagemin.buffer(jpgBuffer, {
          plugins: [imageminMozjpeg()],
        })

        const node = await createFileNodeFromBuffer({
          ext: `.jpg`,
          name,
          buffer: optimizedBuffer,
          getCache,
          createNode,
          createNodeId,
        })

        screenshotNodes.push(node)
      } catch (err) {
        console.log(`Failed to take screenshots:`)
        console.error(err)
        throw err
      }
    }

    await remove(tmpDir)

    return screenshotNodes
  }

  createFromProfile = async ({ publicDir, path, name, fieldArgs, info }) => {
    const profileName = fieldArgs.profile
    const profile = this.profiles[profileName]

    if (!profile) {
      throw new Error(`Unable to locate FFMPEG profile ${profileName}`)
    }

    if (!profile.extension) {
      throw new Error(
        `FFMPEG profile ${profileName} has no extension specified`
      )
    }

    if (!profile.converter) {
      throw new Error(
        `FFMPEG profile ${profileName} has no converter function specified`
      )
    }

    const filename = `${name}-${profileName}.${profile.extension}`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    return this.queueConvertVideo({
      profile: profile.converter,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })
  }

  createH264 = async ({ publicDir, path, name, fieldArgs, info }) => {
    const filename = `${name}-h264.mp4`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    return this.queueConvertVideo({
      profile: profileH264,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })
  }

  createH265 = async ({ publicDir, path, name, fieldArgs, info }) => {
    const filename = `${name}-h265.mp4`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    return this.queueConvertVideo({
      profile: profileH265,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })
  }

  createVP9 = async ({ publicDir, path, name, fieldArgs, info }) => {
    const filename = `${name}-vp9.webm`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    return this.queueConvertVideo({
      profile: profileVP9,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })
  }

  createWebP = async ({ publicDir, path, name, fieldArgs, info }) => {
    const filename = `${name}-webp.webp`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    return this.queueConvertVideo({
      profile: profileWebP,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })
  }

  createGif = async ({ publicDir, path, name, fieldArgs, info }) => {
    const filename = `${name}-gif.gif`
    const cachePath = resolve(this.cacheDirConverted, filename)
    const publicPath = resolve(publicDir, filename)

    const absolutePath = await this.queueConvertVideo({
      profile: profileGif,
      sourcePath: path,
      cachePath,
      publicPath,
      fieldArgs,
      info,
    })

    await imagemin([publicPath], {
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

    return absolutePath
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

  // Create scale filter based on given field args
  generateScaleFilter({ maxWidth, maxHeight }) {
    if (!maxHeight) {
      return `'min(${maxWidth},iw)':-2:flags=lanczos`
    }
    return `'min(iw*min(1\\,min(${maxWidth}/iw\\,${maxHeight}/ih)), iw)':-2:flags=lanczos`
  }

  // Locates video stream and returns metadata
  parseVideoStream = streams => {
    const videoStream = streams.find(stream => stream.codec_type === `video`)

    const currentFps = parseInt(videoStream.r_frame_rate.split(`/`)[0])
    return { videoStream, currentFps }
  }
}
