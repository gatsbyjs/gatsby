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
  transformOptions?: {
    fit?: Fit
  }
  jpgOptions?: Record<string, unknown>
  pngOptions?: Record<string, unknown>
  webpOptions?: Record<string, unknown>
  blurredOptions?: Record<string, unknown>
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
    // We extract these because they're not meant to be passed-down to GatsbyImage
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
  if (
    props.layout !== `fixed` &&
    (propName === `width` || propName === `height`) &&
    props[propName]
  ) {
    return new Error(
      `"${propName}" ${props[propName]} may not be passed when layout is "${
        props.layout || `constrained`
      }"`
    )
  } else {
    if (
      props.layout === `fixed` &&
      (propName === `maxWidth` || propName === `maxHeight`) &&
      props[propName]
    ) {
      return new Error(
        `"${propName}" may not be passed when layout is "${props.layout}"`
      )
    }
  }
  return PropTypes.number(props, propName, ...rest)
}

const validLayouts = new Set([`fixed`, `fluid`, `constrained`])

export const propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: checkDimensionProps,
  height: checkDimensionProps,
  maxHeight: checkDimensionProps,
  maxWidth: checkDimensionProps,
  sizes: PropTypes.string,
  layout: (props: IStaticImageProps & IPrivateProps): Error | undefined => {
    if (props.layout === undefined) {
      return undefined
    }
    if (validLayouts.has(props.layout.toLowerCase())) {
      return undefined
    }

    return new Error(
      `Invalid value ${props.layout}" provided for prop "layout". Defaulting to "fixed". Valid values are "fixed", "fluid" or "constrained"`
    )
  },
}

StaticImage.displayName = `StaticImage`
StaticImage.propTypes = propTypes

export { StaticImage }
