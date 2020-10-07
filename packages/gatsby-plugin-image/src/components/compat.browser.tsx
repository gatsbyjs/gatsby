import React, { FunctionComponent, ComponentType, ElementType } from "react"
import { GatsbyImageProps } from "./gatsby-image.browser"
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
  }
}

function warnForArtDirection(): void {
  if (process?.env?.NODE_ENV === `development`) {
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
    let rewiredProps: Partial<GatsbyImageProps> = {
      alt: ``,
      as: Tag,
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
        fixed = fixed[0]
      }

      rewiredProps = {
        placeholder: null,
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

      if (fixed.base64 || fixed.tracedSVG) {
        rewiredProps.placeholder = {
          fallback: fixed.tracedSVG || fixed.base64,
        }
      }

      if (fixed.srcWebp) {
        rewiredProps.images.sources.push({
          srcSet: fixed.srcSetWebp,
          type: `image/webp`,
        })
      }
    }

    if (fluid) {
      if (Array.isArray(fluid)) {
        warnForArtDirection()
        fluid = fluid[0]
      }

      rewiredProps = {
        placeholder: null,
        width: 1,
        height: fluid.aspectRatio,
        layout: `responsive`,
        images: {
          fallback: {
            src: fluid.src,
            srcSet: fluid.srcSet,
          },
          sources: [],
        },
      }

      if (fluid.base64 || fluid.tracedSVG) {
        rewiredProps.placeholder = {
          fallback: fluid.tracedSVG || fluid.base64,
        }
      }

      if (fluid.srcWebp) {
        rewiredProps.images.sources.push({
          srcSet: fluid.srcSetWebp,
          type: `image/webp`,
        })
      }
    }

    return (
      <Component alt="" {...props} {...(rewiredProps as GatsbyImageProps)} />
    )
  }

  return GatsbyImageCompat
}

export const GatsbyImage: FunctionComponent<ICompatProps> = _createCompatLayer(
  GatsbyImageOriginal
)
