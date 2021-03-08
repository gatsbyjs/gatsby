import {
  GatsbyImage as GatsbyImageBrowser,
  IGatsbyImageData,
} from "./gatsby-image.browser"
import React from "react"
import {
  _getStaticImage,
  propTypes,
  IStaticImageProps,
} from "./static-image.server"
// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  __imageData?: IGatsbyImageData
  __error?: string
}

const StaticImage: React.FC<
  IStaticImageProps & IPrivateProps
> = _getStaticImage(GatsbyImageBrowser)

StaticImage.displayName = `StaticImage`
StaticImage.propTypes = propTypes

export { StaticImage }
