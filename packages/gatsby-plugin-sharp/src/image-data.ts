/* eslint-disable no-unused-expressions */
import { ISharpGatsbyImageData } from "gatsby-plugin-image"
import { GatsbyCache } from "gatsby"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"
import { fixed, fluid, traceSVG } from "."

export interface ISharpGatsbyImageArgs {
  layout?: "fixed" | "fluid" | "constrained"
  placeholder?: "tracedSVG" | "dominantColor" | "blurred" | "none"
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
  const isResponsive = layout !== `fixed`

  const resize = isResponsive ? fluid : fixed

  if (placeholder !== `blurred`) {
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
    images: {
      fallback: {
        src: imageData.src,
        srcSet: imageData.srcSet,
        sizes: imageData.sizes,
      },
      sources: [],
    },
  }

  imageData.aspectRatio = imageData.aspectRatio || 1

  switch (layout) {
    case `fixed`:
      imageProps.width = imageData.width
      imageProps.height = imageData.height
      break

    case `fluid`:
      imageProps.width = 1
      imageProps.height = 1 / imageData.aspectRatio
      break

    case `constrained`:
      imageProps.width = args.maxWidth || imageData.presentationWidth || 1
      imageProps.height = (imageProps.width || 1) / imageData.aspectRatio
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
