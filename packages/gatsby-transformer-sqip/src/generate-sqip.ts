import { resolve, parse } from "path"

import Debug from "debug"
import { promises, constants } from "fs"
import svgToMiniDataURI from "mini-svg-data-uri"
import PQueue from "p-queue"
import { sqip, SqipPluginOptions, SqipResult } from "sqip"
import { createContentDigest } from "gatsby-core-utils"
import { GatsbyCache } from "gatsby"

const queue = new PQueue({ concurrency: 1 })
const debug = Debug(`gatsby-transformer-sqip`)

export async function generateSqip(options: {
  cache: GatsbyCache
  absolutePath: string
  numberOfPrimitives?: number
  blur?: number
  mode?: number
  cacheDir: string
  contentDigest: string
}): Promise<{
  svg: string
  dataURI: string
} | null> {
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

  const sqipBaseConfig: Omit<SqipPluginOptions["sqipConfig"], "input"> = {
    plugins: [
      {
        name: `sqip-plugin-primitive`,
        options: {
          numberOfPrimitives,
          mode,
        },
      },
      {
        name: `sqip-plugin-blur`,
        options: {
          blur,
        },
      },
      `sqip-plugin-svgo`,
      `sqip-plugin-data-uri`,
    ],
  }

  const optionsHash = createContentDigest(sqipBaseConfig)

  const cacheKey = `${contentDigest}-${optionsHash}`
  const cachePathSvg = resolve(cacheDir, `${contentDigest}-${optionsHash}.svg`)

  debug(
    `Request preview generation for ${name} (${contentDigest}-${optionsHash})`
  )

  return queue.add(async () => {
    let primitiveData = await cache.get(cacheKey)
    let svg: Buffer
    // let dataURI: string
    if (!primitiveData) {
      debug(
        `Executing preview generation request for ${name} (${contentDigest}-${optionsHash})`
      )

      try {
        try {
          await promises.access(cachePathSvg, constants.R_OK)
          debug(
            `SQIP data already generated for ${name} (${contentDigest}-${optionsHash})`
          )
          svg = await promises.readFile(cachePathSvg)
        } catch {
          debug(
            `Generateing SQIP data for ${name} (${contentDigest}-${optionsHash})`
          )

          const res = await sqip({
            input: absolutePath,
            ...sqipBaseConfig,
          })

          const result: SqipResult = res as SqipResult
          svg = result.content
          // dataURI = result.metadata.data
          await promises.writeFile(cachePathSvg, svg)
          debug(
            `Wrote primitive result file to disk for ${name} (${contentDigest}-${optionsHash})`
          )
        }

        primitiveData = {
          svg: svg.toString(),
          dataURI: svgToMiniDataURI(svg.toString()),
        }

        await cache.set(cacheKey, primitiveData)
      } catch (err) {
        err.message = `Unable to generate SQIP for ${name} (${contentDigest}-${optionsHash})\n${err.message}`

        throw err
      }
    }

    return primitiveData
  })
}
