/* eslint-disable no-unused-expressions */
import { GatsbyImageProps } from "gatsby-plugin-image"
import { GatsbyCache } from "gatsby"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"
import { fixed, fluid, traceSVG } from "."

export interface ISharpGatsbyImageArgs {
  layout?: "fixed" | "responsive" | "intrinsic"
  placeholder?: "tracedSVG" | "dominantColor" | "base64" | "none"
  tracedSVGOptions?: Record<string, unknown>
  [key: string]: unknown
}

export async function gatsbyImageProps({
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
}): Promise<Omit<GatsbyImageProps, "alt"> | undefined> {
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
  const imageProps: Pick<
    GatsbyImageProps,
    "layout" | "width" | "height" | "images" | "placeholder" | "style"
  > = {
    // const imageProps = {
    layout,
    placeholder: undefined,
    style: undefined,
    width: isResponsive ? 1 : imageData.width,
    height: isResponsive ? imageData.aspectRatio : imageData.height,
    images: {
      fallback: {
        src: imageData.src,
        srcSet: imageData.srcSet,
        sizes: imageData.sizes,
      },
      sources: [],
    },
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
    imageProps.style = { backgroundColor: imageData.dominantColor }
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
