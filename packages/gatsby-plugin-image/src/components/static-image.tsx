import {
  GatsbyImage as GatsbyImageBrowser,
  IGatsbyImageData,
} from "./gatsby-image.browser"
import { _getStaticImage } from "./static-image.server"
import { StaticImageProps } from "../utils"
// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  __imageData?: IGatsbyImageData
  __error?: string
}

export const StaticImage: React.FC<
  StaticImageProps & IPrivateProps
> = _getStaticImage(GatsbyImageBrowser)
