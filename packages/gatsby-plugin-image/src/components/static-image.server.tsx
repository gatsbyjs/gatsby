import React, { FunctionComponent } from "react"
import { splitProps, AllProps } from "../utils"
import { FluidObject, FixedObject } from "gatsby-image"
import { GatsbyImage as GatsbyImageServer } from "./gatsby-image.server"
import { GatsbyImageProps } from "./gatsby-image.browser"

// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  parsedValues?: FluidObject & FixedObject
  __error?: string
}

export function _getStaticImage(
  GatsbyImage: FunctionComponent<GatsbyImageProps>
): React.FC<AllProps & IPrivateProps> {
  return function StaticImage({
    src,
    parsedValues,
    __error,
    ...props
  }): JSX.Element {
    if (__error) {
      console.warn(__error)
    }

    const { gatsbyImageProps, layout } = splitProps({ src, ...props })
    if (parsedValues) {
      const isResponsive = layout === `responsive`
      const props: Pick<
        GatsbyImageProps,
        "layout" | "width" | "height" | "images" | "placeholder"
      > = {
        layout,
        placeholder: null,
        width: isResponsive ? 1 : parsedValues.width,
        height: isResponsive ? parsedValues.aspectRatio : parsedValues.height,
        images: {
          fallback: {
            src: parsedValues.src,
            srcSet: parsedValues.srcSet,
          },
          sources: [],
        },
      }

      const placeholder = parsedValues.tracedSVG || parsedValues.base64

      if (placeholder) {
        props.placeholder = {
          fallback: placeholder,
        }
      }

      if (parsedValues.srcWebp) {
        props.images.sources.push({
          srcSet: parsedValues.srcSetWebp,
          type: `image/webp`,
        })
      }

      return <GatsbyImage {...gatsbyImageProps} {...props} />
    }
    console.warn(`Image not loaded`, src)
    if (!__error && process.env.NODE_ENV === `development`) {
      console.warn(
        `Please ensure that "gatsby-plugin-image" is included in the plugins array in gatsby-config.js`
      )
    }
    return null
  }
}

export const StaticImage: React.FC<AllProps & IPrivateProps> = _getStaticImage(
  GatsbyImageServer
)
