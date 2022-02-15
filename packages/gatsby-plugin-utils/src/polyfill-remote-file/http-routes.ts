import path from "path"
import fs from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import { hasFeature } from "../has-feature"
import { getFileExtensionFromMimeType } from "./utils/mime-type-helpers"
import { generateImageArgs } from "./utils/url-generator"
import { transformImage } from "./transform-images"

import type { ImageFit } from "./types"
import type { Application } from "express"

export function polyfillImageServiceDevRoutes(app: Application): void {
  if (hasFeature(`image-cdn`)) {
    return
  }

  addImageRoutes(app)
}

export function addImageRoutes(app: Application): Application {
  app.get(`/_gatsby/file/:url`, async (req, res) => {
    // remove the file extension
    const [url] = req.params.url.split(`.`)
    const outputDir = path.join(
      global.__GATSBY?.root || process.cwd(),
      `public`,
      `_gatsby`,
      `file`
    )

    const filePath = await fetchRemoteFile({
      directory: outputDir,
      url: url,
      name: req.params.url,
    })
    fs.createReadStream(filePath).pipe(res)
  })

  app.get(`/_gatsby/image/:url/:params`, async (req, res) => {
    const [params, extension] = req.params.params.split(`.`)
    const url = req.params.url

    const searchParams = new URLSearchParams(
      Buffer.from(params, `base64`).toString()
    )

    const resizeParams: {
      width: number
      height: number
      format: string
      fit: ImageFit
    } = {
      width: 0,
      height: 0,
      format: ``,
      fit: `cover`,
    }

    for (const [key, value] of searchParams) {
      switch (key) {
        case `w`: {
          resizeParams.width = Number(value)
          break
        }
        case `h`: {
          resizeParams.height = Number(value)
          break
        }
        case `fm`: {
          resizeParams.format = value
          break
        }
        case `fit`: {
          resizeParams.fit = value as ImageFit
          break
        }
      }
    }

    const remoteUrl = Buffer.from(url, `base64`).toString()
    const outputDir = path.join(
      global.__GATSBY?.root || process.cwd(),
      `public`,
      `_gatsby`,
      `_image`,
      url
    )

    const filePath = await transformImage({
      outputDir,
      args: {
        url: remoteUrl,
        filename: generateImageArgs(resizeParams) + `.${extension}`,
        ...resizeParams,
      },
    })

    res.setHeader(`content-type`, getFileExtensionFromMimeType(extension))

    fs.createReadStream(filePath).pipe(res)
  })

  return app
}
