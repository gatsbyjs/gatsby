import React, { FunctionComponent } from "react"
import { splitProps, AllProps } from "../utils"
import { FluidObject, FixedObject } from "gatsby-image"
import { GatsbyImage as GatsbyImageServer } from "./compat"
import { ICompatProps } from "./compat.browser"

// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  parsedValues?: FluidObject & FixedObject
  __error?: string
}

export function _getStaticImage(
  GatsbyImage: FunctionComponent<ICompatProps>
): React.FC<AllProps & IPrivateProps> {
  return function StaticImage({
    src,
    parsedValues,
    fluid,
    fixed,
    __error,
    ...props
  }): JSX.Element {
    const isFixed = fixed ?? !fluid
    if (__error) {
      console.warn(__error)
    }

    const { gatsbyImageProps } = splitProps({ src, ...props })
    if (parsedValues) {
      const imageProps = isFixed
        ? { fixed: parsedValues }
        : { fluid: parsedValues }

      return <GatsbyImage {...gatsbyImageProps} {...imageProps} />
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
