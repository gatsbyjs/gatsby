import { resolve, parse } from "path"

import Debug from "debug"
import { exists, readFile, writeFile } from "fs-extra"
import PQueue from "p-queue"
import { sqip } from "sqip"
import { createContentDigest } from "gatsby-core-utils"

const queue = new PQueue({ concurrency: 1 })
const debug = Debug(`gatsby-transformer-sqip`)

export default async function generateSqip(options) {
  const {
    cache,
    absolutePath,
    numberOfPrimitives,
    blur,
    mode,
    cacheDir,
    contentDigest,
  } = options

  debug({ options })

  const { name, ext } = parse(absolutePath)

  if (!ext.match(/(jpe?g|png|gif)$/)) {
    debug(`Unsupported file type ${name} (${contentDigest})`)
    return null
  }

  const sqipOptions = {
    numberOfPrimitives,
    blur,
    mode,
  }

  const optionsHash = createContentDigest(sqipOptions)

  const cacheKey = `${contentDigest}-${optionsHash}`
  const cachePath = resolve(cacheDir, `${contentDigest}-${optionsHash}.json`)

  debug(
    `Request preview generation for ${name} (${contentDigest}-${optionsHash})`
  )

  return queue.add(async () => {
    let primitiveData = await cache.get(cacheKey)
    let svg

    if (!primitiveData) {
      debug(
        `Executing preview generation request for ${name} (${contentDigest}-${optionsHash})`
      )

      try {
        if (await exists(cachePath)) {
          debug(
            `Primitive result file already exists for ${name} (${contentDigest}-${optionsHash})`
          )
          const cacheBuffer = await readFile(cachePath)
          svg = JSON.parse(cacheBuffer.toString())
        } else {
          debug(
            `Generate primitive result file of ${name} (${contentDigest}-${optionsHash})`
          )

          const result = await sqip({
            input: absolutePath,
            plugins: [
              {
                name: `sqip-plugin-primitive`,
                options: {
                  numberOfPrimitives: sqipOptions.numberOfPrimitives,
                  mode: sqipOptions.mode,
                },
              },
              sqipOptions.blur && {
                name: `sqip-plugin-blur`,
                options: {
                  blur: sqipOptions.blur,
                },
              },
              `sqip-plugin-data-uri`,
              `sqip-plugin-svgo`,
            ].filter(Boolean),
          })

          const { dataURI, ...metadata } = result.metadata

          svg = {
            svg: result.content.toString(),
            dataURI,
            metadata: metadata,
          }

          await writeFile(cachePath, JSON.stringify(svg))
          debug(
            `Wrote primitive result file to disk for ${name} (${contentDigest}-${optionsHash})`
          )
        }

        primitiveData = svg

        await cache.set(cacheKey, primitiveData)
      } catch (err) {
        err.message = `Unable to generate SQIP for ${name} (${contentDigest}-${optionsHash})\n${err.message}`

        throw err
      }
    }

    return primitiveData
  })
}
