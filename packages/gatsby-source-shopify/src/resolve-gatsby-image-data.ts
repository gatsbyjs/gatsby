import { fetchRemoteFile } from "gatsby-core-utils"
import {
  generateImageData,
  getLowResolutionImageURL,
  IGatsbyImageData,
  IGatsbyImageHelperArgs,
  IImage,
  ImageFormat,
} from "gatsby-plugin-image"
import { readFileSync } from "fs"
import { IShopifyImage, urlBuilder } from "./get-shopify-image"

type ImageLayout = "constrained" | "fixed" | "fullWidth"

type IImageWithPlaceholder = IImage & {
  placeholder: string
}

async function getImageBase64({
  imageAddress,
  cache,
}: {
  imageAddress: string
  cache: any
}): Promise<string> {
  // Downloads file to the site cache and returns the file path for the given image (this is a path on the host system, not a URL)
  const filePath = await fetchRemoteFile({
    url: imageAddress,
    cache,
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

export function makeResolveGatsbyImageData(cache: any) {
  return async function resolveGatsbyImageData(
    image: Node & IShopifyImage,
    {
      formats = [`auto`],
      layout = `constrained`,
      ...options
    }: { formats: Array<ImageFormat>; layout: ImageLayout }
  ): Promise<IGatsbyImageData> {
    const remainingOptions = options as Record<string, any>
    let [basename] = image.originalSrc.split(`?`)

    const dot = basename.lastIndexOf(`.`)
    let ext = ``
    if (dot !== -1) {
      ext = basename.slice(dot + 1)
      basename = basename.slice(0, dot)
    }

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

    if (remainingOptions && remainingOptions.placeholder === `BLURRED`) {
      // This function returns the URL for a 20px-wide image, to use as a blurred placeholder
      const lowResImageURL = getLowResolutionImageURL({
        ...remainingOptions,
        aspectRatio: remainingOptions.width / remainingOptions.height, // Workaround - fixes height being NaN; we can remove this once gatsby-plugin-image is fixed
        formats,
        layout,
        sourceMetadata,
        pluginName: `gatsby-source-shopify`,
        filename: image.originalSrc,
        generateImageSource,
      })
      const imageBase64 = await getImageBase64({
        imageAddress: lowResImageURL,
        cache,
      })

      // This would be your own function to download and generate a low-resolution placeholder
      remainingOptions.placeholderURL = getBase64DataURI({
        imageBase64,
      })
    }
    return generateImageData({
      ...remainingOptions,
      formats,
      layout,
      sourceMetadata,
      pluginName: `gatsby-source-shopify`,
      filename: image.originalSrc,
      generateImageSource,
    })
  }
}
