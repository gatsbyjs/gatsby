import React, { FunctionComponent, ReactElement } from "react"
import {
  altValidator,
  GatsbyImage as GatsbyImageServer,
} from "./gatsby-image.server"
import { GatsbyImageProps, IGatsbyImageData } from "./gatsby-image.browser"
import PropTypes from "prop-types"
import { ISharpGatsbyImageArgs } from "../image-utils"

export interface IStaticImageProps
  extends Omit<GatsbyImageProps, "image">,
    Omit<ISharpGatsbyImageArgs, "backgroundColor"> {
  src: string
  filename?: string
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
    height,
    aspectRatio,
    tracedSVGOptions,
    placeholder,
    formats,
    quality,
    transformOptions,
    jpgOptions,
    pngOptions,
    webpOptions,
    avifOptions,
    blurredOptions,
    breakpoints,
    outputPixelDensities,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...props
  }): ReactElement {
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

const StaticImage: React.FC<IStaticImageProps & IPrivateProps> =
  _getStaticImage(GatsbyImageServer)

const checkDimensionProps: PropTypes.Validator<number> = (
  props: IStaticImageProps & IPrivateProps,
  propName: keyof IStaticImageProps & IPrivateProps,
  ...rest
) => {
  if (
    props.layout === `fullWidth` &&
    (propName === `width` || propName === `height`) &&
    props[propName]
  ) {
    return new Error(
      `"${propName}" ${props[propName]} may not be passed when layout is fullWidth.`
    )
  }
  return PropTypes.number(props, propName, ...rest)
}

const validLayouts = new Set([`fixed`, `fullWidth`, `constrained`])

export const propTypes = {
  src: PropTypes.string.isRequired,
  alt: altValidator,
  width: checkDimensionProps,
  height: checkDimensionProps,
  sizes: PropTypes.string,
  layout: (props: IStaticImageProps & IPrivateProps): Error | undefined => {
    if (props.layout === undefined) {
      return undefined
    }
    if (validLayouts.has(props.layout)) {
      return undefined
    }

    return new Error(
      `Invalid value ${props.layout}" provided for prop "layout". Defaulting to "constrained". Valid values are "fixed", "fullWidth" or "constrained".`
    )
  },
}

StaticImage.displayName = `StaticImage`
StaticImage.propTypes = propTypes

export { StaticImage }
