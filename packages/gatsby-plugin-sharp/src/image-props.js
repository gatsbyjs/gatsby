import { GatsbyImageProps } from "gatsby-plugin-image"
import { GatsbyCache } from "gatsby"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"
import { fixed, fluid } from "."

// export interface ISharpGatsbyImageArgs {
//   layout?: "fixed" | "responsive" | "intrinsic"
// }

export async function gatsbyImageProps({ file, args = {}, reporter, cache }) {
  // }: {
  //   file: string
  //   args: ISharpGatsbyImageArgs
  //   cache: GatsbyCache
  //   reporter: Reporter
  // }): Promise<Omit<GatsbyImageProps, "alt"> | undefined> {
  // TODO: fancy stuff

  const layout = args.layout || `fixed`

  const isResponsive = layout !== `fixed`

  const resize = isResponsive ? fluid : fixed

  const imageData = await resize({ file, args, reporter, cache })

  if (!imageData) {
    return undefined
  }
  // const imageProps: Pick<
  //   GatsbyImageProps,
  //   "layout" | "width" | "height" | "images" | "placeholder"
  // > = {
  const imageProps = {
    layout,
    placeholder: null,
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

  const placeholder = imageData.tracedSVG || imageData.base64

  if (placeholder) {
    imageProps.placeholder = {
      fallback: placeholder,
    }
  }

  const webp = await resize({
    file,
    args: { ...args, toFormat: `webp` },
    reporter,
    cache,
  })

  if (imageData.srcWebp) {
    // eslint-disable-next-line no-unused-expressions
    imageProps.images.sources?.push({
      srcSet: webp.srcSet,
      type: `image/webp`,
      sizes: imageData.sizes,
    })
  }

  return imageProps
}
