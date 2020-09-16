import React from "react"
import { splitProps, AllProps } from "./utils"
import Image, { FluidObject, FixedObject } from "gatsby-image"

// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  parsedValues?: FluidObject & FixedObject
}

export const StaticImage: React.FC<AllProps & IPrivateProps> = ({
  src,
  parsedValues,
  fluid,
  fixed,
  ...props
}) => {
  const isFixed = fixed ?? !fluid

  const { gatsbyImageProps } = splitProps({ src, ...props })
  if (parsedValues) {
    const imageProps = isFixed
      ? { fixed: parsedValues }
      : { fluid: parsedValues }

    return <Image {...gatsbyImageProps} {...imageProps} />
  }
  return <p>Not an image</p>
}
