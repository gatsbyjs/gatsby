import { readFileSync } from "fs"
import { GatsbyCache } from "gatsby"
import { IGatsbyImageFieldArgs } from "gatsby-plugin-image/graphql-utils"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import {
  generateImageData,
  getLowResolutionImageURL,
  IGatsbyImageData,
  IGatsbyImageHelperArgs,
  IImage,
  ImageFormat,
} from "gatsby-plugin-image"

import { urlBuilder } from "./get-shopify-image"
import { parseImageExtension } from "./helpers"

type IImageWithPlaceholder = IImage & {
  placeholder: string
}

async function getImageBase64({
  imageAddress,
  directory,
  imageId,
}: {
  imageAddress: string
  directory: string
  imageId: string
}): Promise<string> {
  // Downloads file to the site cache and returns the file path for the given image (this is a path on the host system, not a URL)
  const filePath = await fetchRemoteFile({
    url: imageAddress,
    directory,
    cacheKey: imageId,
  })
  const buffer = readFileSync(filePath)
  return buffer.toString(`base64`)
}

/**
 * Download and generate a low-resolution placeholder
 *
 * @param lowResImageFile
 */
function getBase64DataURI({ imageBase64 }: { imageBase64: string }): string {
  return `data:image/png;base64,${imageBase64}`
}

export function makeResolveGatsbyImageData(cache: GatsbyCache) {
  return async function resolveGatsbyImageData(
    image: IShopifyImage,
    {
      formats = [`auto`],
      layout = `constrained`,
      ...remainingOptions
    }: IGatsbyImageFieldArgs
  ): Promise<IGatsbyImageData | null> {
    // Sharp cannot optimize GIFs so we must return null in that case
    const ext = parseImageExtension(image.originalSrc)
    if (ext === `gif`) return null

    let placeholderURL

    const generateImageSource: IGatsbyImageHelperArgs["generateImageSource"] = (
      filename,
      width,
      height,
      toFormat
    ): IImageWithPlaceholder => {
      return {
        width,
        height,
        placeholder: ``,
        format: toFormat,
        src: urlBuilder({
          width,
          height,
          baseUrl: filename,
          format: toFormat,
          options: {},
        }),
      }
    }

    const sourceMetadata = {
      width: image.width,
      height: image.height,
      format: ext as ImageFormat,
    }

    if (remainingOptions && remainingOptions.placeholder === `blurred`) {
      // This function returns the URL for a 20px-wide image, to use as a blurred placeholder
      const lowResImageURL = getLowResolutionImageURL({
        ...remainingOptions,
        formats,
        layout,
        sourceMetadata,
        pluginName: `gatsby-source-shopify`,
        filename: image.originalSrc,
        generateImageSource,
      })

      const imageBase64 = await getImageBase64({
        imageAddress: lowResImageURL,
        directory: cache.directory as string,
        imageId: image.id,
      })

      placeholderURL = getBase64DataURI({ imageBase64 })
    }
    return generateImageData({
      ...remainingOptions,
      placeholderURL,
      formats,
      layout,
      sourceMetadata,
      pluginName: `gatsby-source-shopify`,
      filename: image.originalSrc,
      generateImageSource,
    })
  }
}
