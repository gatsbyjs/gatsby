/* eslint-disable no-unused-expressions */
import { ISharpGatsbyImageData } from "gatsby-plugin-image"
import { GatsbyCache } from "gatsby"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"
import { fixed, fluid, traceSVG } from "."

export interface ISharpGatsbyImageArgs {
  layout?: "fixed" | "fluid" | "constrained"
  placeholder?: "tracedSVG" | "dominantColor" | "base64" | "none"
  tracedSVGOptions?: Record<string, unknown>
  [key: string]: unknown
}

export async function generateImageData({
  file,
  args: {
    layout = `fixed`,
    placeholder = `dominantColor`,
    tracedSVGOptions = {},
    ...args
  },
  reporter,
  cache,
}: {
  file: string
  args: ISharpGatsbyImageArgs
  cache: GatsbyCache
  reporter: Reporter
}): Promise<ISharpGatsbyImageData | undefined> {
  // TODO: fancy stuff

  const isResponsive = layout !== `fixed`

  const resize = isResponsive ? fluid : fixed

  if (placeholder !== `base64`) {
    args.base64 = false
  }

  if (placeholder === `dominantColor`) {
    args.dominantColor = true
  }

  const imageData = await resize({ file, args, reporter, cache })

  if (!imageData) {
    return undefined
  }
  const imageProps: ISharpGatsbyImageData = {
    layout,
    placeholder: undefined,
    width: imageData.width,
    height: imageData.height,
    images: {
      fallback: {
        src: imageData.src,
        srcSet: imageData.srcSet,
        sizes: imageData.sizes,
      },
      sources: [],
    },
  }

  if (layout === `fluid`) {
    imageProps.width = 1
    imageProps.height = imageData.aspectRatio
  }

  if (placeholder === `tracedSVG`) {
    const fallback: string = await traceSVG({
      file,
      args: tracedSVGOptions,
      fileArgs: args,
      cache,
      reporter,
    })
    imageProps.placeholder = {
      fallback,
    }
  } else if (imageData.base64) {
    imageProps.placeholder = {
      fallback: imageData.base64,
    }
  } else if (placeholder === `dominantColor`) {
    imageProps.backgroundColor = imageData.dominantColor
  }

  if (args.webP) {
    const webp = await resize({
      file,
      args: { ...args, base64: false, dominantColor: false, toFormat: `webp` },
      reporter,
      cache,
    })

    imageProps.images.sources?.push({
      srcSet: webp.srcSet,
      type: `image/webp`,
      sizes: imageData.sizes,
    })
  }

  return imageProps
}
