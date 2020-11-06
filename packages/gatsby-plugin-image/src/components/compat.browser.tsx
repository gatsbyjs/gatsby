import React, { FunctionComponent, ComponentType, ElementType } from "react"
import { GatsbyImageProps, ISharpGatsbyImageData } from "./gatsby-image.browser"
import { GatsbyImage as GatsbyImageOriginal } from "./gatsby-image.browser"

export interface ICompatProps {
  backgroundColor?: string | true
  critical?: boolean
  Tag?: ElementType
  fixed?: {
    base64?: string
    tracedSVG?: string
    width: number
    height: number
    src: string
    srcSet: string
    srcWebp?: string
    srcSetWebp?: string
  }
  fluid?: {
    base64?: string
    tracedSVG?: string
    aspectRatio: number
    src: string
    srcSet: string
    srcWebp?: string
    srcSetWebp?: string
    maxWidth?: number
    maxHeight?: number
    sizes?: string
  }
}

function warnForArtDirection(): void {
  if (process.env.NODE_ENV === `development`) {
    console.warn(
      `gatsby-plugin-image/compat does not support passing arrays to "fixed" or "fluid"`
    )
  }
}

export function _createCompatLayer(
  Component: ComponentType<GatsbyImageProps>
): FunctionComponent<ICompatProps> {
  const GatsbyImageCompat: FunctionComponent<ICompatProps> = function GatsbyImageCompat({
    fixed,
    fluid,
    backgroundColor,
    critical,
    Tag,
    ...props
  }) {
    const rewiredProps: Partial<GatsbyImageProps> = {
      alt: ``,
      as: Tag,
      image: undefined,
      ...props,
    }

    if (backgroundColor) {
      rewiredProps.style = rewiredProps.style || {}
      rewiredProps.style.backgroundColor =
        backgroundColor === true ? `light-gray` : backgroundColor
    }

    if (critical) {
      rewiredProps.loading = `eager`
    }

    if (fixed) {
      if (Array.isArray(fixed)) {
        warnForArtDirection()
        fixed = fixed[0] as Exclude<ICompatProps["fixed"], undefined>
      }

      const image: ISharpGatsbyImageData = {
        placeholder: undefined,
        layout: `fixed`,
        width: fixed.width,
        height: fixed.height,
        images: {
          fallback: {
            src: fixed.src,
            srcSet: fixed.srcSet,
          },
          sources: [],
        },
      }

      const placeholder = fixed.tracedSVG || fixed.base64

      if (placeholder) {
        image.placeholder = {
          fallback: placeholder,
        }
      }

      if (fixed.srcSetWebp) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        image.images.sources!.push({
          srcSet: fixed.srcSetWebp,
          type: `image/webp`,
        })
      }
      rewiredProps.image = image
    } else if (fluid) {
      if (Array.isArray(fluid)) {
        warnForArtDirection()
        fluid = fluid[0] as Exclude<ICompatProps["fluid"], undefined>
      }

      const image: ISharpGatsbyImageData = {
        width: 1,
        height: fluid.aspectRatio,
        layout: `fluid`,
        images: {
          fallback: {
            src: fluid.src,
            srcSet: fluid.srcSet,
            sizes: fluid.sizes,
          },
          sources: [],
        },
      }
      const placeholder = fluid.tracedSVG || fluid.base64

      if (placeholder) {
        image.placeholder = {
          fallback: placeholder,
        }
      }

      if (fluid.srcSetWebp) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        image.images!.sources!.push({
          srcSet: fluid.srcSetWebp,
          type: `image/webp`,
          sizes: fluid.sizes,
        })
      }

      rewiredProps.image = image
    }

    return <Component {...props} {...(rewiredProps as GatsbyImageProps)} />
  }

  return GatsbyImageCompat
}

export const GatsbyImage: FunctionComponent<ICompatProps> = _createCompatLayer(
  GatsbyImageOriginal
)
