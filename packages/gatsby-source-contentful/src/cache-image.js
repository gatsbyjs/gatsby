const crypto = require(`crypto`)
const { resolve, parse } = require(`path`)

const axios = require(`axios`)
const { pathExists, createWriteStream } = require(`fs-extra`)

const { CACHE_NAME } = require(`./constants`)

module.exports = async function cacheImage(cache, image, options) {
  const CACHE_DIR = resolve(cache.rootPath(CACHE_NAME))
  const {
    file: { url, fileName, details },
  } = image
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

  const aspectRatio = details.image.height / details.image.width
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

  const alreadyExists = await pathExists(absolutePath)

  if (!alreadyExists) {
    const previewUrl = `http:${url}?${params.join(`&`)}`

    const response = await axios({
      method: `get`,
      url: previewUrl,
      responseType: `stream`,
    })

    await new Promise((resolve, reject) => {
      const file = createWriteStream(absolutePath)
      response.data.pipe(file)
      file.on(`finish`, resolve)
      file.on(`error`, reject)
    })
  }

  return absolutePath
}
