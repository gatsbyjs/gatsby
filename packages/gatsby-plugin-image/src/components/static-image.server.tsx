import React, { FunctionComponent } from "react"
import { GatsbyImage as GatsbyImageServer } from "./gatsby-image.server"
import { GatsbyImageProps, IGatsbyImageData } from "./gatsby-image.browser"
import PropTypes from "prop-types"
import { ImageFormat, Layout, Fit } from "../image-utils"

export interface IStaticImageProps extends Omit<GatsbyImageProps, "image"> {
  src: string
  layout?: Layout
  formats?: Array<ImageFormat>
  placeholder?: "tracedSVG" | "dominantColor" | "blurred" | "none"
  tracedSVGOptions?: Record<string, unknown>
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  sizes?: string
  quality?: number
  transformOptions: {
    fit?: Fit
  }
  jpgOptions?: Record<string, unknown>
  pngOptions?: Record<string, unknown>
  webpOptions?: Record<string, unknown>
  blurredOptions: Record<string, unknown>
}

// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  __imageData?: IGatsbyImageData
  __error?: string
}

export function _getStaticImage(
  GatsbyImage: FunctionComponent<GatsbyImageProps>
): React.FC<IStaticImageProps & IPrivateProps> {
  return function StaticImage({
    src,
    __imageData: imageData,
    __error,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    width,
    maxWidth,
    height,
    maxHeight,
    tracedSVGOptions,
    placeholder,
    formats,
    quality,
    transformOptions,
    jpgOptions,
    pngOptions,
    webpOptions,
    blurredOptions,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...props
  }): JSX.Element {
    if (__error) {
      console.warn(__error)
    }

    if (imageData) {
      return <GatsbyImage image={imageData} {...props} />
    }
    console.warn(`Image not loaded`, src)
    if (!__error && process.env.NODE_ENV === `development`) {
      console.warn(
        `Please ensure that "gatsby-plugin-image" is included in the plugins array in gatsby-config.js, and that your version of gatsby is at least 2.24.78`
      )
    }
    return null
  }
}

const StaticImage: React.FC<
  IStaticImageProps & IPrivateProps
> = _getStaticImage(GatsbyImageServer)

const checkDimensionProps: PropTypes.Validator<number> = (
  props: IStaticImageProps & IPrivateProps,
  propName: keyof IStaticImageProps & IPrivateProps,
  ...rest
) => {
  if (props.layout === `fluid` || props.layout === `constrained`) {
    if (propName === `maxWidth` && !props[propName]) {
      return new Error(
        `The prop "${propName}" is required when layout is "${props.layout}"`
      )
    }
    if ((propName === `width` || propName === `height`) && props[propName]) {
      return new Error(
        `"${propName}" ${props[propName]} may not be passed when layout is "${props.layout}"`
      )
    }
  } else {
    if (
      (propName === `maxWidth` || propName === `maxHeight`) &&
      props[propName]
    ) {
      return new Error(
        `"${propName}" may not be passed when layout is "${props.layout}"`
      )
    }
    if (propName === `width` && !props[propName]) {
      return new Error(
        `The prop "${propName}" is required when layout is "${props.layout}"`
      )
    }
  }
  return PropTypes.number(props, propName, ...rest)
}

export const propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: checkDimensionProps,
  height: checkDimensionProps,
  maxHeight: checkDimensionProps,
  maxWidth: checkDimensionProps,
  sizes: PropTypes.string,
}

StaticImage.displayName = `StaticImage`
StaticImage.propTypes = propTypes

export { StaticImage }
