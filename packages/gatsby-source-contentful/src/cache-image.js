const crypto = require(`crypto`)
const { resolve, parse } = require(`path`)

const { pathExists, createWriteStream } = require(`fs-extra`)

const downloadWithRetry = require(`./download-with-retry`).default

const inFlightImageCache = new Map()

module.exports = async function cacheImage(store, image, options) {
  const program = store.getState().program
  const CACHE_DIR = resolve(`${program.directory}/.cache/contentful/assets/`)
  const { url, fileName } = image
  const {
    width,
    height,
    maxWidth,
    maxHeight,
    resizingBehavior,
    cropFocus,
    background,
  } = options
  const userWidth = maxWidth || width
  const userHeight = maxHeight || height

  const aspectRatio = image.height / image.width
  const resultingWidth = Math.round(userWidth || 800)
  const resultingHeight = Math.round(userHeight || resultingWidth * aspectRatio)

  const params = [`w=${resultingWidth}`, `h=${resultingHeight}`]
  if (resizingBehavior) {
    params.push(`fit=${resizingBehavior}`)
  }
  if (cropFocus) {
    params.push(`crop=${cropFocus}`)
  }
  if (background) {
    params.push(`bg=${background}`)
  }

  const optionsHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify([url, ...params]))
    .digest(`hex`)

  const { name, ext } = parse(fileName)
  const absolutePath = resolve(CACHE_DIR, `${name}-${optionsHash}${ext}`)

  // Query the filesystem for file existence
  const alreadyExists = await pathExists(absolutePath)
  // Whether the file exists or not, if we are downloading it then await
  const inFlight = inFlightImageCache.get(absolutePath)
  if (inFlight) {
    await inFlight
  } else if (!alreadyExists) {
    // File doesn't exist and is not being download yet
    const downloadPromise = new Promise((resolve, reject) => {
      const previewUrl = `http:${url}?${params.join(`&`)}`

      downloadWithRetry({
        url: previewUrl,
        responseType: `stream`,
      })
        .then(response => {
          const file = createWriteStream(absolutePath)
          response.data.pipe(file)
          file.on(`finish`, resolve)
          file.on(`error`, reject)
        })
        .catch(reject)
    })
    inFlightImageCache.set(absolutePath, downloadPromise)
    await downloadPromise
    // When the file is downloaded, remove the promise from the cache
    inFlightImageCache.delete(absolutePath)
  }

  // Now the file should be completely downloaded
  return absolutePath
}
