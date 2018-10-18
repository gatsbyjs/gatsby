const crypto = require(`crypto`)
const { resolve, parse } = require(`path`)

const Debug = require(`debug`)
const { exists, readFile, writeFile } = require(`fs-extra`)
const svgToMiniDataURI = require(`mini-svg-data-uri`)
const PQueue = require(`p-queue`)
const sqip = require(`sqip`)

const queue = new PQueue({ concurrency: 1 })
const debug = Debug(`gatsby-transformer-sqip`)

module.exports = async function generateSqip(options) {
  const {
    cache,
    absolutePath,
    numberOfPrimitives,
    blur,
    mode,
    cacheDir,
  } = options

  debug({ options })

  const { name } = parse(absolutePath)

  const sqipOptions = {
    numberOfPrimitives,
    blur,
    mode,
  }

  const optionsHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(sqipOptions))
    .digest(`hex`)

  const cacheKey = `sqip-${name}-${optionsHash}`
  const cachePath = resolve(cacheDir, `${name}-${optionsHash}.svg`)
  let primitiveData = await cache.get(cacheKey)

  debug({ primitiveData })

  if (!primitiveData) {
    let svg
    if (await exists(cachePath)) {
      const svgBuffer = await readFile(cachePath)
      svg = svgBuffer.toString()
    } else {
      debug(`generate sqip for ${name}`)
      const result = await queue.add(
        async () =>
          new Promise((resolve, reject) => {
            try {
              const result = sqip({
                filename: absolutePath,
                ...sqipOptions,
              })
              resolve(result)
            } catch (error) {
              reject(error)
            }
          })
      )

      svg = result.final_svg

      await writeFile(cachePath, svg)
    }

    primitiveData = {
      svg,
      dataURI: svgToMiniDataURI(svg),
    }

    await cache.set(cacheKey, primitiveData)
  }

  return primitiveData
}
