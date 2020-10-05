import { FluidObject, FixedObject } from "gatsby-image"
import { GatsbyImage as GatsbyImageBrowser } from "./compat.browser"
import { _getStaticImage } from "./static-image.server"
import { AllProps } from "../utils"
// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  parsedValues?: FluidObject & FixedObject
  __error?: string
}

export const StaticImage: React.FC<AllProps & IPrivateProps> = _getStaticImage(
  GatsbyImageBrowser
)
